import logging
from fastapi import APIRouter, HTTPException, Request
from dependencies import get_client_ip
from services.rate_limiter import check_rate_limit
from services.captcha_service import verify_captcha
from services.email_service import send_followup, send_schedule_notification
from database import get_db_connection
from utils import normalize_email, normalize_text, is_duplicate_error, duplicate_response, raise_internal_error
from models.requests import ScheduleRequest

router = APIRouter(prefix="/api", tags=["schedule"])
logger = logging.getLogger(__name__)


@router.post("/schedule")
async def schedule_online(request: ScheduleRequest, req: Request):
    """Insert schedule request into DB and send follow-up email"""
    client_ip = get_client_ip(req)
    is_allowed, rate_limit_msg = check_rate_limit(client_ip, "schedule")
    if not is_allowed:
        raise HTTPException(status_code=429, detail=rate_limit_msg)

    if not verify_captcha(request.captchaToken):
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
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                try:
                    cur.execute(
                        """
                        INSERT INTO "Schedule Online"
                            (first_name, last_name, email, phone, message)
                        VALUES (%s, %s, %s, %s, %s)
                        """,
                        (first_name, last_name, email, phone, message),
                    )
                except Exception as insert_error:
                    if is_duplicate_error(insert_error):
                        conn.rollback()
                        return duplicate_response(
                            "A schedule request already exists for this contact. Our team will reach out soon."
                        )
                    raise
            conn.commit()

        try:
            send_followup(email, first_name)
            email_status = "sent"
        except HTTPException as email_error:
            logger.exception(
                "Message saved to Supabase but follow-up email failed: %s",
                email_error.detail,
            )
            email_status = "failed"

        # Notify company (non-critical)
        send_schedule_notification(email, first_name, last_name, phone, message)

        if email_status == "sent":
            return {"success": True, "emailStatus": "sent"}
        return {
            "success": True,
            "emailStatus": "failed",
            "message": "Schedule request saved, but follow-up email could not be sent.",
        }
    except Exception as e:
        raise_internal_error("schedule_online failed", e)
