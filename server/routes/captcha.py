import os
import logging
import requests
from fastapi import APIRouter, HTTPException, Request
from dependencies import get_client_ip
from services.rate_limiter import check_rate_limit

router = APIRouter(prefix="/api", tags=["captcha"])
logger = logging.getLogger(__name__)

HCAPTCHA_SECRET_KEY = os.getenv("HCAPTCHA_SECRET_KEY")


@router.post("/verify-captcha")
async def verify_captcha(request: dict, req: Request):
    """Verify hCaptcha token from frontend"""
    client_ip = get_client_ip(req)
    is_allowed, rate_limit_msg = check_rate_limit(client_ip, "verify-captcha")
    if not is_allowed:
        raise HTTPException(status_code=429, detail=rate_limit_msg)

    token = request.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="Token is required")

    if not HCAPTCHA_SECRET_KEY:
        logger.warning("HCAPTCHA_SECRET_KEY not configured, allowing request")
        return {"success": True, "message": "hCaptcha not configured"}

    try:
        response = requests.post(
            "https://api.hcaptcha.com/siteverify",
            data={"secret": HCAPTCHA_SECRET_KEY, "response": token},
            timeout=5,
        )
        response.raise_for_status()
        data = response.json()
        success = data.get("success", False)

        logger.info("hCaptcha verification: success=%s", success)

        if success:
            return {"success": True}
        else:
            logger.warning("hCaptcha validation failed: success=%s", success)
            raise HTTPException(
                status_code=403,
                detail="Failed captcha verification. Please try again.",
            )
    except requests.RequestException as e:
        logger.exception("hCaptcha API error: %s", str(e))
        raise HTTPException(status_code=500, detail="Captcha verification failed")
