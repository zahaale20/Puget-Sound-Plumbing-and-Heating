import hashlib
import hmac
import logging
import os
import secrets
from typing import Any
from urllib.parse import quote

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse

from database import get_db_connection
from dependencies import require_rate_limit
from models.requests import NewsletterRequest
from services.captcha_service import verify_captcha
from services.email_service import (
    LOGO_URL,
    send_newsletter_confirmation,
    send_newsletter_notification,
    send_newsletter_unsubscribe_confirmation,
    send_newsletter_unsubscribe_notification,
)
from utils import is_duplicate_error, normalize_email, raise_internal_error

router = APIRouter(prefix="/api", tags=["newsletter"])
logger = logging.getLogger(__name__)


async def _safe_send_newsletter_notification(email: str) -> None:
    """Best-effort company notification; never propagates errors."""
    try:
        await send_newsletter_notification(email)
    except Exception:
        logger.exception("Background send_newsletter_notification failed")


async def _safe_send_newsletter_unsubscribe_notification(email: str) -> None:
    """Best-effort company unsubscribe notification; never propagates errors."""
    try:
        await send_newsletter_unsubscribe_notification(email)
    except Exception:
        logger.exception("Background send_newsletter_unsubscribe_notification failed")

_NEWSLETTER_SECRET_ENV = os.getenv("NEWSLETTER_UNSUBSCRIBE_SECRET")
if _NEWSLETTER_SECRET_ENV:
    NEWSLETTER_UNSUBSCRIBE_SECRET = _NEWSLETTER_SECRET_ENV
elif os.getenv("VERCEL") or os.getenv("PROD") or os.getenv("ENV", "").lower() in {"prod", "production"}:
    # Hard-fail in production: a per-process random secret would silently
    # invalidate every previously issued unsubscribe link on each redeploy.
    raise RuntimeError(
        "NEWSLETTER_UNSUBSCRIBE_SECRET must be set in production. "
        "Generate one with `python -c 'import secrets; print(secrets.token_urlsafe(32))'` "
        "and configure it as an environment variable."
    )
else:
    NEWSLETTER_UNSUBSCRIBE_SECRET = secrets.token_urlsafe(32)
    logger.warning(
        "NEWSLETTER_UNSUBSCRIBE_SECRET not set; generated an ephemeral dev secret. "
        "Unsubscribe links will be invalidated on every restart."
    )


def generate_unsubscribe_token(email: str) -> str:
    normalized = normalize_email(email)
    return hmac.new(
        NEWSLETTER_UNSUBSCRIBE_SECRET.encode("utf-8"),
        normalized.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def build_unsubscribe_url(email: str) -> str:
    base_url = (
        os.getenv("NEWSLETTER_UNSUBSCRIBE_BASE_URL")
        or os.getenv("PUBLIC_API_BASE_URL")
        or os.getenv("BACKEND_BASE_URL")
    )

    if base_url:
        normalized_base = base_url.rstrip("/")
    else:
        vercel_url = os.getenv("VERCEL_URL")
        if vercel_url:
            normalized_base = (
                vercel_url.rstrip("/")
                if vercel_url.startswith("http")
                else f"https://{vercel_url.rstrip('/')}"
            )
        else:
            normalized_base = "http://localhost:8001"

    normalized_email = normalize_email(email)
    token = generate_unsubscribe_token(normalized_email)
    return (
        f"{normalized_base}/api/newsletter/unsubscribe"
        f"?email={quote(normalized_email)}&token={quote(token)}"
    )


@router.post("/newsletter", dependencies=[Depends(require_rate_limit("newsletter"))])
async def subscribe_newsletter(request: NewsletterRequest, req: Request, background_tasks: BackgroundTasks) -> dict[str, Any]:
    """Save newsletter subscription email to DB and send confirmation email"""
    if not await verify_captcha(request.captchaToken):
        raise HTTPException(
            status_code=403,
            detail="Security verification failed. Please try again.",
        )

    email = normalize_email(request.email)
    duplicate = False

    try:
        async with get_db_connection() as conn:
            async with conn.cursor() as cur:
                try:
                    await cur.execute(
                        'INSERT INTO "Newsletter" (email) VALUES (%s)',
                        (email,),
                    )
                except Exception as insert_error:
                    if is_duplicate_error(insert_error):
                        duplicate = True
                        await conn.rollback()
                    else:
                        raise
            await conn.commit()

        unsubscribe_url = build_unsubscribe_url(email)
        if duplicate:
            email_status = "skipped"
        else:
            try:
                await send_newsletter_confirmation(email, unsubscribe_url)
                await _safe_send_newsletter_notification(email)
                email_status = "sent"
            except HTTPException as email_error:
                logger.exception(
                    "Newsletter saved but confirmation email failed: %s",
                    email_error.detail,
                )
                email_status = "failed"

        if duplicate:
            return {
                "success": True,
                "emailStatus": "skipped",
                "duplicate": True,
                "message": "This email is already subscribed to the mailing list.",
            }

        if email_status == "sent":
            return {"success": True, "emailStatus": "sent"}
        return {
            "success": True,
            "emailStatus": "failed",
            "message": "Subscription saved, but confirmation email could not be sent.",
        }
    except Exception as e:
        raise_internal_error("subscribe_newsletter failed", e)


@router.get("/newsletter/unsubscribe", dependencies=[Depends(require_rate_limit("unsubscribe"))], response_model=None)
async def unsubscribe_newsletter(
    email: str,
    background_tasks: BackgroundTasks,
    req: Request,
    token: str | None = None,
) -> dict[str, Any] | HTMLResponse:
    """One-click unsubscribe endpoint that removes user from mailing list."""
    normalized_email = normalize_email(email)
    if token is None or not token.strip():
        raise HTTPException(status_code=400, detail="Unsubscribe token is required.")

    expected_token = generate_unsubscribe_token(normalized_email)
    if not hmac.compare_digest(token.strip(), expected_token):
        raise HTTPException(status_code=400, detail="Invalid unsubscribe link.")

    try:
        async with get_db_connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    'DELETE FROM "Newsletter" WHERE lower(email)=lower(%s)',
                    (normalized_email,),
                )
                deleted = cur.rowcount
            await conn.commit()

        if deleted > 0:
            try:
                await send_newsletter_unsubscribe_confirmation(normalized_email)
            except HTTPException as email_error:
                logger.exception(
                    "Unsubscribed from newsletter but confirmation email failed: %s",
                    email_error.detail,
                )

            # Notify company (awaited inline; BackgroundTasks is not durable on serverless)
            await _safe_send_newsletter_unsubscribe_notification(normalized_email)

        return HTMLResponse(content=_UNSUBSCRIBE_PAGE, status_code=200)
    except Exception as e:
        raise_internal_error("unsubscribe_newsletter failed", e)


_UNSUBSCRIBE_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Unsubscribed &mdash; Puget Sound Plumbing and Heating</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#fff;font-family:'Open Sans',sans-serif;color:#2B2B2B}
  .card{max-width:480px;width:90%%;text-align:center;padding:48px 24px}
  .card img{max-width:260px;width:100%%;margin-bottom:32px}
  .icon{width:56px;height:56px;margin:0 auto 16px;background:#e6f4ea;border-radius:50%%;display:flex;align-items:center;justify-content:center}
  .icon svg{width:28px;height:28px;fill:#1e8e3e}
  h1{font-family:'Montserrat',sans-serif;font-size:24px;font-weight:700;color:#0C2D70;margin-bottom:12px}
  p{font-size:15px;line-height:1.6;color:#2B2B2B;margin-bottom:24px}
  .btn{display:inline-block;padding:12px 32px;font-family:'Open Sans',sans-serif;font-size:15px;font-weight:600;color:#fff;background:#B32020;text-decoration:none;transition:background .3s}
  .btn:hover{background:#7a1515}
  .meta{font-size:12px;color:#999;margin-top:32px;margin-bottom:0}
</style>
</head>
<body>
<div class="card">
  <img src="%s" alt="Puget Sound Plumbing and Heating"/>
  <div class="icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>
  <h1>You've Been Unsubscribed</h1>
  <p>You will no longer receive newsletter emails from us. If this was a mistake, you can subscribe again on our website.</p>
  <a class="btn" href="https://pugetsoundplumbingandheating.com">Back to Home</a>
  <p class="meta">Puget Sound Plumbing and Heating &middot; 11803 Des Moines Memorial Dr S, Burien, WA 98168</p>
</div>
</body>
</html>""" % LOGO_URL
