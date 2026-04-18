import logging
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from fastapi.responses import JSONResponse

from database import get_db_connection
from dependencies import require_rate_limit
from models.requests import ScheduleRequest
from services.captcha_service import verify_captcha
from services.email_service import send_followup, send_schedule_notification
from utils import (
    duplicate_response,
    is_duplicate_error,
    normalize_email,
    normalize_text,
    raise_internal_error,
)

router = APIRouter(prefix="/api", tags=["schedule"])
logger = logging.getLogger(__name__)


async def _safe_send_schedule_notification(*args: Any, **kwargs: Any) -> None:
    """Best-effort company notification; never propagates errors."""
    try:
        await send_schedule_notification(*args, **kwargs)
    except Exception:
        logger.exception("Background send_schedule_notification failed")


@router.post("/schedule", dependencies=[Depends(require_rate_limit("schedule"))], response_model=None)
async def schedule_online(request: ScheduleRequest, req: Request, background_tasks: BackgroundTasks) -> dict[str, Any] | JSONResponse:
    """Insert schedule request into DB and send follow-up email"""
    if not await verify_captcha(request.captchaToken):
        raise HTTPException(
            status_code=403,
            detail="Security verification failed. Please try again.",
        )

    first_name = normalize_text(request.firstName)
    last_name = normalize_text(request.lastName)
    email = normalize_email(request.email)
    phone = normalize_text(request.phone)
    message = request.message.strip()

    try:
        async with get_db_connection() as conn:
            async with conn.cursor() as cur:
                try:
                    await cur.execute(
                        """
                        INSERT INTO "Schedule Online"
                            (first_name, last_name, email, phone, message)
                        VALUES (%s, %s, %s, %s, %s)
                        """,
                        (first_name, last_name, email, phone, message),
                    )
                except Exception as insert_error:
                    if is_duplicate_error(insert_error):
                        await conn.rollback()
                        return duplicate_response(
                            "A schedule request already exists for this contact. Our team will reach out soon."
                        )
                    raise
            await conn.commit()

        try:
            await send_followup(email, first_name)
            email_status = "sent"
        except HTTPException as email_error:
            logger.exception(
                "Message saved to Supabase but follow-up email failed: %s",
                email_error.detail,
            )
            email_status = "failed"

        # Notify company (non-critical, off the request critical path).
        background_tasks.add_task(
            _safe_send_schedule_notification,
            email, first_name, last_name, phone, message,
        )

        if email_status == "sent":
            return {"success": True, "emailStatus": "sent"}
        return {
            "success": True,
            "emailStatus": "failed",
            "message": "Schedule request saved, but follow-up email could not be sent.",
        }
    except Exception as e:
        raise_internal_error("schedule_online failed", e)
