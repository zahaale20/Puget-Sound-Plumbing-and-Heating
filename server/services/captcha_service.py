"""hCaptcha verification — single source of truth.

`verify_captcha(token)` returns a bool for the simple case used by form routes.
`verify_captcha_detailed(token)` returns rich result info for the dedicated
`/api/verify-captcha` endpoint, which surfaces structured errors to the client.

Both are coroutines: the entire backend runs on an async event loop (see
ADR 0002). A synchronous HTTP client here would hold the loop thread for the
duration of the hCaptcha round-trip and serialize every in-flight request on
the same worker. We use `httpx.AsyncClient` to keep the loop free.
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass, field

import httpx

from services.http_client import get_http_client
from services.resilience import CircuitBreaker, retry_async

logger = logging.getLogger(__name__)

HCAPTCHA_VERIFY_URL = "https://api.hcaptcha.com/siteverify"
HCAPTCHA_TIMEOUT_SEC = float(os.getenv("HCAPTCHA_TIMEOUT_SEC", "5"))
HCAPTCHA_MAX_ATTEMPTS = int(os.getenv("HCAPTCHA_MAX_ATTEMPTS", "3"))
HCAPTCHA_RETRY_BACKOFF_SEC = float(os.getenv("HCAPTCHA_RETRY_BACKOFF_SEC", "0.25"))
HCAPTCHA_MAX_BACKOFF_SEC = float(os.getenv("HCAPTCHA_MAX_BACKOFF_SEC", "1.5"))
HCAPTCHA_CB_FAILURE_THRESHOLD = int(os.getenv("HCAPTCHA_CB_FAILURE_THRESHOLD", "3"))
HCAPTCHA_CB_OPEN_SEC = float(os.getenv("HCAPTCHA_CB_OPEN_SEC", "20"))

_hcaptcha_breaker = CircuitBreaker(
    name="hcaptcha",
    failure_threshold=HCAPTCHA_CB_FAILURE_THRESHOLD,
    recovery_timeout_sec=HCAPTCHA_CB_OPEN_SEC,
)


def _secret() -> str | None:
    # Read at call-time so tests / runtime env changes are honoured.
    return os.getenv("HCAPTCHA_SECRET_KEY")


def _bypass_enabled() -> bool:
    return os.getenv("ALLOW_CAPTCHA_BYPASS", "false").lower() == "true"


@dataclass(frozen=True)
class CaptchaResult:
    success: bool
    # "ok" | "missing_token" | "missing_secret" | "rejected" | "network_error"
    reason: str
    error_codes: tuple[str, ...] = field(default_factory=tuple)


async def verify_captcha_detailed(token: str | None) -> CaptchaResult:
    """Verify an hCaptcha token with structured result info."""
    if not token:
        return CaptchaResult(False, "missing_token")

    secret = _secret()
    if not secret:
        if _bypass_enabled():
            logger.warning(
                "HCAPTCHA_SECRET_KEY missing; bypassing per ALLOW_CAPTCHA_BYPASS=true"
            )
            return CaptchaResult(True, "missing_secret")
        logger.error("HCAPTCHA_SECRET_KEY is missing in production")
        return CaptchaResult(False, "missing_secret")

    if not _hcaptcha_breaker.allow_request():
        logger.warning("hCaptcha circuit open; failing fast")
        return CaptchaResult(False, "network_error")

    def _should_retry(exc: Exception) -> bool:
        if isinstance(exc, (httpx.TimeoutException, httpx.RequestError)):
            return True
        if isinstance(exc, httpx.HTTPStatusError) and exc.response is not None:
            return exc.response.status_code == 429 or exc.response.status_code >= 500
        return False

    async def _attempt_verify() -> dict:
        client = await get_http_client()
        response = await client.post(
            HCAPTCHA_VERIFY_URL,
            data={"secret": secret, "response": token},
            timeout=HCAPTCHA_TIMEOUT_SEC,
        )
        response.raise_for_status()
        return response.json()

    try:
        data = await retry_async(
            _attempt_verify,
            attempts=HCAPTCHA_MAX_ATTEMPTS,
            initial_backoff_sec=HCAPTCHA_RETRY_BACKOFF_SEC,
            max_backoff_sec=HCAPTCHA_MAX_BACKOFF_SEC,
            should_retry=_should_retry,
            operation_name="hCaptcha verify",
        )
        _hcaptcha_breaker.record_success()
    except httpx.HTTPError as e:
        _hcaptcha_breaker.record_failure()
        logger.warning("hCaptcha network error: %s", str(e))
        return CaptchaResult(False, "network_error")

    success = bool(data.get("success", False))
    codes = tuple(data.get("error-codes", []) or [])
    logger.info("hCaptcha verify: success=%s codes=%s", success, codes)
    return CaptchaResult(success, "ok" if success else "rejected", codes)


async def verify_captcha(token: str | None) -> bool:
    """Backwards-compatible boolean wrapper used by form routes."""
    return (await verify_captcha_detailed(token)).success
