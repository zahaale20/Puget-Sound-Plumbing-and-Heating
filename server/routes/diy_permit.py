import logging
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from dependencies import require_rate_limit
from services.captcha_service import verify_captcha
from services.email_service import send_diy_permit_confirmation, send_diy_permit_notification
from database import get_db_connection
from utils import normalize_email, normalize_text, is_duplicate_error, duplicate_response, raise_internal_error
from models.requests import DiyPermitRequest

router = APIRouter(prefix="/api", tags=["diy-permit"])
logger = logging.getLogger(__name__)


def _safe_send_diy_permit_notification(*args, **kwargs) -> None:
    """Best-effort company notification; never propagates errors."""
    try:
        send_diy_permit_notification(*args, **kwargs)
    except Exception:
        logger.exception("Background send_diy_permit_notification failed")


@router.post("/diy-permit", dependencies=[Depends(require_rate_limit("diy-permit"))])
async def submit_diy_permit(request: DiyPermitRequest, req: Request, background_tasks: BackgroundTasks):
    """Insert DIY permit request into DB and send confirmation email"""
    if not verify_captcha(request.captchaToken):
        raise HTTPException(
            status_code=403,
            detail="Security verification failed. Please try again.",
        )

    first_name = normalize_text(request.firstName)
    last_name = normalize_text(request.lastName)
    email = normalize_email(request.email)
    phone = normalize_text(request.phone)
    address = normalize_text(request.address)

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                try:
                    cur.execute(
                        """
                        INSERT INTO "DIY Permit Requests"
                            (first_name, last_name, email, phone, address,
                             city, state, zip_code, project_description, inspection)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """,
                        (
                            first_name, last_name, email, phone, address,
                            request.city.strip(), request.state.strip(),
                            request.zipCode.strip(), request.projectDescription.strip(),
                            request.inspection,
                        ),
                    )
                except Exception as insert_error:
                    if is_duplicate_error(insert_error):
                        conn.rollback()
                        return duplicate_response(
                            "A DIY permit request already exists for this contact "
                            "and address. We will be in touch soon."
                        )
                    raise
            conn.commit()

        try:
            send_diy_permit_confirmation(email, first_name, address)
            background_tasks.add_task(
                _safe_send_diy_permit_notification,
                email, first_name, last_name, phone, address,
                request.city.strip(), request.state.strip(),
                request.zipCode.strip(), request.projectDescription.strip(),
                request.inspection,
            )
            return {"success": True, "emailStatus": "sent"}
        except HTTPException as email_error:
            logger.exception(
                "DIY permit saved but email failed: %s", email_error.detail
            )
            return {
                "success": True,
                "emailStatus": "failed",
                "message": "Request saved, but confirmation email could not be sent.",
            }
    except Exception as e:
        raise_internal_error("submit_diy_permit failed", e)
