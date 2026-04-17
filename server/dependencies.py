import os
from fastapi import Depends, HTTPException, Request
from fastapi.responses import JSONResponse

TRUST_PROXY_HEADERS = os.getenv("TRUST_PROXY_HEADERS", "false").lower() == "true"


def get_client_ip(request: Request) -> str:
    """Extract client IP from request, accounting for proxies."""
    forwarded = request.headers.get("x-forwarded-for") if TRUST_PROXY_HEADERS else None
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "0.0.0.0"


def require_rate_limit(endpoint: str):
    """FastAPI dependency that enforces rate limiting before body parsing.

    Usage:
        @router.post("/schedule", dependencies=[Depends(require_rate_limit("schedule"))])
    """
    async def _check(request: Request):
        from services.rate_limiter import check_rate_limit

        ip = get_client_ip(request)
        is_allowed, msg, retry_after = check_rate_limit(ip, endpoint)
        if not is_allowed:
            raise HTTPException(
                status_code=429,
                detail=msg,
                headers={"Retry-After": str(retry_after)},
            )

    return _check
