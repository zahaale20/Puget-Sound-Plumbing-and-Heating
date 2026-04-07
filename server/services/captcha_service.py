import os
import logging
import requests

logger = logging.getLogger(__name__)

HCAPTCHA_SECRET_KEY = os.getenv("HCAPTCHA_SECRET_KEY")
ALLOW_CAPTCHA_BYPASS = os.getenv("ALLOW_CAPTCHA_BYPASS", "false").lower() == "true"


def verify_captcha(token: str | None) -> bool:
    """Verify hCaptcha token. Returns True if valid, False otherwise."""
    if not HCAPTCHA_SECRET_KEY:
        logger.error("HCAPTCHA_SECRET_KEY is missing")
        return ALLOW_CAPTCHA_BYPASS
    if not token:
        return False

    try:
        response = requests.post(
            "https://api.hcaptcha.com/siteverify",
            data={"secret": HCAPTCHA_SECRET_KEY, "response": token},
            timeout=5,
        )
        response.raise_for_status()
        data = response.json()
        success = data.get("success", False)
        logger.info("hCaptcha: success=%s", success)
        return success
    except Exception as e:
        logger.warning("hCaptcha verification error: %s", str(e))
        return False
