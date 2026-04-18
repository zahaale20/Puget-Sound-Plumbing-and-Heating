"""hCaptcha verification endpoint.

This is the *standalone* verification endpoint used by the frontend before
optimistic UI updates. Form routes call `verify_captcha(...)` from
`services.captcha_service` directly — there is exactly one place that talks
to hCaptcha (see ADR 0001).
"""

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request

from dependencies import require_rate_limit
from models.requests import CaptchaVerifyRequest
from services.captcha_service import verify_captcha_detailed

router = APIRouter(prefix="/api", tags=["captcha"])
logger = logging.getLogger(__name__)


@router.post("/verify-captcha", dependencies=[Depends(require_rate_limit("verify-captcha"))])
async def verify_captcha_endpoint(request: CaptchaVerifyRequest, req: Request) -> dict[str, Any]:
    """Verify an hCaptcha token submitted by the frontend."""
    result = await verify_captcha_detailed(request.token)

    if result.success:
        # `missing_secret` here means dev bypass is enabled.
        if result.reason == "missing_secret":
            return {"success": True, "message": "hCaptcha not configured (dev bypass)"}
        return {"success": True}

    if result.reason == "missing_token":
        raise HTTPException(status_code=400, detail="Token is required")
    if result.reason == "network_error":
        raise HTTPException(status_code=502, detail="Captcha verification temporarily unavailable")
    if result.reason == "missing_secret":
        # Production misconfig — log loudly, deny request.
        logger.error("HCAPTCHA_SECRET_KEY missing in non-dev environment")
        raise HTTPException(status_code=500, detail="Captcha is not configured")
    # rejected
    raise HTTPException(
        status_code=403, detail="Failed captcha verification. Please try again."
    )
