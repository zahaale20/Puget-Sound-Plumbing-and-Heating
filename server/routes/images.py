import os
from fastapi import APIRouter, HTTPException, Request
from services.s3_service import S3Service
from services.rate_limiter import check_rate_limit

router = APIRouter(prefix="/api/images", tags=["Images"])
s3_service = S3Service()
TRUST_PROXY_HEADERS = os.getenv("TRUST_PROXY_HEADERS", "false").lower() == "true"


def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for") if TRUST_PROXY_HEADERS else None
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "0.0.0.0"


@router.get("/{image_name:path}")
async def get_image_url(image_name: str, req: Request = None):
    if req:
        client_ip = _get_client_ip(req)
        is_allowed, rate_limit_msg = check_rate_limit(client_ip, "images")
        if not is_allowed:
            raise HTTPException(status_code=429, detail=rate_limit_msg)

    if not s3_service.supabase_url:
        raise HTTPException(status_code=404, detail="Storage URL configuration missing")

    url = s3_service.get_image_url(image_name)
    if not url:
        raise HTTPException(status_code=400, detail="Invalid image path")
    return {"url": url}