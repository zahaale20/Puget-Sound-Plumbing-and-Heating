import os
import re
import logging
from typing import Optional
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, UploadFile, File, Form
from dependencies import require_rate_limit
from services.captcha_service import verify_captcha
from services.email_service import send_job_application_confirmation, send_job_application_notification
from services.storage_service import StorageService
from database import get_db_connection
from utils import normalize_email, normalize_text, is_duplicate_error, duplicate_response, raise_internal_error

router = APIRouter(prefix="/api", tags=["careers"])
logger = logging.getLogger(__name__)

storage_service = StorageService()


def _safe_send_job_application_notification(*args, **kwargs) -> None:
    """Best-effort company notification; never propagates errors."""
    try:
        send_job_application_notification(*args, **kwargs)
    except Exception:
        logger.exception("Background send_job_application_notification failed")

MAX_RESUME_SIZE_BYTES = int(os.getenv("MAX_RESUME_SIZE_BYTES", str(5 * 1024 * 1024)))
ALLOWED_RESUME_EXTENSIONS = {".pdf", ".doc", ".docx"}
ALLOWED_RESUME_CONTENT_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


def sanitize_resume_filename(filename: str) -> str:
    filename = os.path.basename((filename or "").strip())
    filename = re.sub(r"[^a-zA-Z0-9._-]", "_", filename)
    filename = filename.strip("._")
    return filename or "resume.pdf"


def validate_resume_upload(resume: UploadFile, resume_bytes: bytes) -> str:
    if not resume_bytes:
        raise HTTPException(status_code=400, detail="Uploaded resume is empty")

    if len(resume_bytes) > MAX_RESUME_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="Resume file is too large")

    safe_filename = sanitize_resume_filename(resume.filename or "resume.pdf")
    extension = os.path.splitext(safe_filename)[1].lower()

    if extension not in ALLOWED_RESUME_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported resume file type")

    content_type = (resume.content_type or "").lower()
    if content_type and content_type not in ALLOWED_RESUME_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported resume content type")

    return safe_filename


@router.post("/job-application", dependencies=[Depends(require_rate_limit("job-application"))])
async def submit_job_application(
    firstName: str = Form(...),
    lastName: str = Form(...),
    phone: str = Form(...),
    email: str = Form(...),
    position: str = Form(...),
    experience: str = Form(""),
    message: str = Form(""),
    additionalInfo: str = Form(""),
    captchaToken: Optional[str] = Form(None),
    resume: Optional[UploadFile] = File(None),
    background_tasks: BackgroundTasks = None,
    req: Request = None,
):
    """Insert job application into DB, email resume to company, send confirmation to applicant"""
    if not verify_captcha(captchaToken):
        raise HTTPException(
            status_code=403,
            detail="Security verification failed. Please try again.",
        )

    norm_first = normalize_text(firstName)
    norm_last = normalize_text(lastName)
    norm_phone = normalize_text(phone)
    norm_email = normalize_email(email)
    norm_position = normalize_text(position)

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                try:
                    cur.execute(
                        """
                        INSERT INTO "Job Applications"
                            (first_name, last_name, email, phone, position)
                        VALUES (%s, %s, %s, %s, %s)
                        """,
                        (norm_first, norm_last, norm_email, norm_phone, norm_position),
                    )
                except Exception as insert_error:
                    if is_duplicate_error(insert_error):
                        conn.rollback()
                        return duplicate_response(
                            "A job application already exists for this email and position. "
                            "Our team will follow up if needed."
                        )
                    raise
            conn.commit()

        resume_bytes = None
        resume_filename = None
        if resume:
            resume_bytes = await resume.read()
            resume_filename = validate_resume_upload(resume, resume_bytes)
            resume_storage_key = storage_service.upload_resume(resume_bytes, resume_filename)
            if not resume_storage_key:
                logger.warning(
                    "Failed to upload resume %s to storage, will attach to email anyway",
                    resume_filename,
                )

        try:
            send_job_application_confirmation(norm_email, norm_first, norm_position)
            if background_tasks is not None:
                background_tasks.add_task(
                    _safe_send_job_application_notification,
                    norm_email, norm_first, norm_last, norm_position,
                    resume_bytes, resume_filename,
                )
            else:
                _safe_send_job_application_notification(
                    norm_email, norm_first, norm_last, norm_position,
                    resume_bytes, resume_filename,
                )
            return {"success": True, "emailStatus": "sent"}
        except HTTPException as email_error:
            logger.exception(
                "Application saved but email notification failed: %s",
                email_error.detail,
            )
            return {
                "success": True,
                "emailStatus": "failed",
                "message": "Application saved, but email notification could not be sent.",
            }
    except Exception as e:
        raise_internal_error("submit_job_application failed", e)
