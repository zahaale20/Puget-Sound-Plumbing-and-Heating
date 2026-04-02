import os
import base64
import logging
import hashlib
import hmac
import secrets
import requests
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Response, Request
from fastapi.responses import HTMLResponse
from typing import Optional
from urllib.parse import quote
import resend
from database import get_db_connection
from services.s3_service import S3Service
from services.rate_limiter import check_rate_limit
from models.requests import EmailRequest, ScheduleRequest, NewsletterRequest, RedeemOfferRequest, DiyPermitRequest

router = APIRouter(prefix="/api", tags=["email"])
resend.api_key = os.getenv("RESEND_API_KEY")
logger = logging.getLogger(__name__)
EMAIL_FROM = os.getenv("RESEND_FROM_EMAIL", "noreply@cavostudio.com")
COMPANY_EMAIL = "alexthebestest@gmail.com"
s3_service = S3Service()
HCAPTCHA_SECRET_KEY = os.getenv("HCAPTCHA_SECRET_KEY")
NEWSLETTER_UNSUBSCRIBE_SECRET = (
    os.getenv("NEWSLETTER_UNSUBSCRIBE_SECRET")
    or os.getenv("RESEND_API_KEY")
    or os.getenv("SUPABASE_PASSWORD")
    or "pspah-newsletter-unsubscribe-secret"
)


def _get_client_ip(request: Request) -> str:
    """Extract client IP from request, accounting for proxies"""
    # Check X-Forwarded-For first — behind Vercel/reverse proxies,
    # request.client.host is the proxy IP, not the real client.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "0.0.0.0"


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _normalize_text(value: str) -> str:
    return value.strip()


def _is_duplicate_error(error: Exception) -> bool:
    error_text = str(error).lower()
    return "unique" in error_text or "duplicate" in error_text


def _raise_internal_api_error(context: str, error: Exception):
    logger.exception("%s: %s", context, str(error))
    raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again.")


def _verify_captcha(token: Optional[str]) -> bool:
    """Verify hCaptcha token (returns True if valid, False otherwise)"""
    if not HCAPTCHA_SECRET_KEY:
        return True  # Allow if hCaptcha not configured
    if not token:
        return False  # Reject missing token when hCaptcha is configured

    try:
        response = requests.post(
            "https://api.hcaptcha.com/siteverify",
            data={"secret": HCAPTCHA_SECRET_KEY, "response": token},
            timeout=5,
        )
        response.raise_for_status()
        data = response.json()

        success = data.get("success", False)

        logger.info(f"hCaptcha: success={success}")
        return success
    except Exception as e:
        logger.warning(f"hCaptcha verification error: {str(e)}")
        return False  # Fail securely


def _duplicate_response(message: str):
    return {
        "success": True,
        "duplicate": True,
        "emailStatus": "skipped",
        "message": message,
    }


import re as _re

def _generate_coupon_id(coupon_discount: str) -> str:
    """Generate a unique coupon ID from the discount string plus a random suffix.

    Format: PSPAH-<discount_digits>-<6 random hex chars>
    Example: '$19.50 OFF' -> 'PSPAH-1950-a3f7c2'
    """
    match = _re.search(r"\$(\d+)\.(\d+)", coupon_discount)
    suffix = secrets.token_hex(3)  # 6 hex chars = 16^6 = ~16M combinations
    if match:
        return f"PSPAH-{match.group(1)}{match.group(2)}-{suffix}"
    return f"PSPAH-{abs(hash(coupon_discount)) % 10000:04d}-{suffix}"


def _generate_newsletter_unsubscribe_token(email: str) -> str:
    normalized_email = _normalize_email(email)
    return hmac.new(
        NEWSLETTER_UNSUBSCRIBE_SECRET.encode("utf-8"),
        normalized_email.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def _build_newsletter_unsubscribe_url(email: str) -> str:
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
                vercel_url.rstrip("/") if vercel_url.startswith("http") else f"https://{vercel_url.rstrip('/')}"
            )
        else:
            normalized_base = "http://localhost:8001"

    normalized_email = _normalize_email(email)
    token = _generate_newsletter_unsubscribe_token(normalized_email)
    return (
        f"{normalized_base}/api/newsletter/unsubscribe"
        f"?email={quote(normalized_email)}&token={quote(token)}"
    )


@router.post("/verify-captcha")
async def verify_captcha(request: dict, req: Request):
    """Verify hCaptcha token from frontend"""
    # Check rate limit
    client_ip = _get_client_ip(req)
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

        # Log the result for monitoring
        logger.info(f"hCaptcha verification: success={success}")

        if success:
            return {"success": True}
        else:
            logger.warning(f"hCaptcha validation failed: success={success}")
            raise HTTPException(
                status_code=403,
                detail="Failed captcha verification. Please try again.",
            )
    except requests.RequestException as e:
        logger.exception(f"hCaptcha API error: {str(e)}")
        raise HTTPException(status_code=500, detail="Captcha verification failed")


@router.post("/send-email")
async def send_email(request: EmailRequest, req: Request):
    """Send a professional follow-up email to schedule online requests"""
    # Check rate limit
    client_ip = _get_client_ip(req)
    is_allowed, rate_limit_msg = check_rate_limit(client_ip, "send-email")
    if not is_allowed:
        raise HTTPException(status_code=429, detail=rate_limit_msg)

    # Verify captcha token
    if not _verify_captcha(request.captchaToken):
        raise HTTPException(
            status_code=403,
            detail="Security verification failed. Please try again.",
        )

    try:
        email = _normalize_email(request.email)
        first_name = _normalize_text(request.firstName)
        _send_followup_email(email, first_name)
        return {"success": True, "emailStatus": "sent", "message": "Email sent successfully"}
    except Exception as e:
        _raise_internal_api_error("send_email failed", e)


@router.post("/schedule")
async def schedule_online(request: ScheduleRequest, req: Request):
    """Insert schedule request into DB and send follow-up email"""
    # Check rate limit
    client_ip = _get_client_ip(req)
    is_allowed, rate_limit_msg = check_rate_limit(client_ip, "schedule")
    if not is_allowed:
        raise HTTPException(status_code=429, detail=rate_limit_msg)
    
    # Verify captcha token
    if not _verify_captcha(request.captchaToken):
        raise HTTPException(
            status_code=403,
            detail="Security verification failed. Please try again.",
        )

    first_name = _normalize_text(request.firstName)
    last_name = _normalize_text(request.lastName)
    email = _normalize_email(request.email)
    phone = _normalize_text(request.phone)
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
                        (
                            first_name,
                            last_name,
                            email,
                            phone,
                            message,
                        ),
                    )
                except Exception as insert_error:
                    if _is_duplicate_error(insert_error):
                        conn.rollback()
                        return _duplicate_response(
                            "A schedule request already exists for this contact. Our team will reach out soon."
                        )
                    raise
            conn.commit()

        try:
            _send_followup_email(email, first_name)
            email_status = "sent"
        except HTTPException as email_error:
            logger.exception("Message saved to Supabase but follow-up email failed: %s", email_error.detail)
            email_status = "failed"

        # Notify company (non-critical)
        _send_schedule_notification_email(email, first_name, last_name, phone, message)

        if email_status == "sent":
            return {"success": True, "emailStatus": "sent"}
        return {
            "success": True,
            "emailStatus": "failed",
            "message": "Schedule request saved, but follow-up email could not be sent.",
        }
    except Exception as e:
        _raise_internal_api_error("schedule_online failed", e)


@router.post("/newsletter")
async def subscribe_newsletter(request: NewsletterRequest, req: Request):
    """Save newsletter subscription email to DB and send confirmation email"""
    # Check rate limit
    client_ip = _get_client_ip(req)
    is_allowed, rate_limit_msg = check_rate_limit(client_ip, "newsletter")
    if not is_allowed:
        raise HTTPException(status_code=429, detail=rate_limit_msg)
    
    # Verify captcha token
    if not _verify_captcha(request.captchaToken):
        raise HTTPException(
            status_code=403,
            detail="Security verification failed. Please try again.",
        )

    email = _normalize_email(request.email)
    duplicate = False

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                try:
                    cur.execute(
                        'INSERT INTO "Newsletter" (email) VALUES (%s)',
                        (email,),
                    )
                except Exception as insert_error:
                    if _is_duplicate_error(insert_error):
                        duplicate = True
                        conn.rollback()
                    else:
                        raise

            conn.commit()

        unsubscribe_url = _build_newsletter_unsubscribe_url(email)
        try:
            _send_newsletter_confirmation_email(email, unsubscribe_url)
            email_status = "sent"
        except HTTPException as email_error:
            logger.exception("Newsletter saved but confirmation email failed: %s", email_error.detail)
            email_status = "failed"

        # Notify company (non-critical)
        _send_newsletter_notification_email(email)

        if email_status == "sent":
            return {
                "success": True,
                "emailStatus": "sent",
                **(
                    {
                        "duplicate": True,
                        "message": "This email is already subscribed to the mailing list.",
                    }
                    if duplicate
                    else {}
                ),
            }
        return {
            "success": True,
            "emailStatus": "failed",
            **({"duplicate": True} if duplicate else {}),
            "message": (
                "This email is already subscribed to the mailing list. We could not resend confirmation email right now."
                if duplicate
                else "Subscription saved, but confirmation email could not be sent."
            ),
        }
    except Exception as e:
        _raise_internal_api_error("subscribe_newsletter failed", e)


@router.get("/newsletter/unsubscribe")
async def unsubscribe_newsletter(email: str, token: Optional[str] = None, req: Request = None):
    """One-click unsubscribe endpoint that removes user from mailing list."""
    # Check rate limit
    if req:
        client_ip = _get_client_ip(req)
        is_allowed, rate_limit_msg = check_rate_limit(client_ip, "unsubscribe")
        if not is_allowed:
            raise HTTPException(status_code=429, detail=rate_limit_msg)

    normalized_email = _normalize_email(email)
    if token is not None and token.strip():
        expected_token = _generate_newsletter_unsubscribe_token(normalized_email)
        if not hmac.compare_digest(token.strip(), expected_token):
            raise HTTPException(status_code=400, detail="Invalid unsubscribe link.")
    else:
        logger.warning("Newsletter unsubscribe called without token for email=%s", normalized_email)

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    'DELETE FROM "Newsletter" WHERE lower(email)=lower(%s)',
                    (normalized_email,),
                )
                deleted = cur.rowcount
            conn.commit()

        if deleted > 0:
            try:
                _send_newsletter_unsubscribe_confirmation_email(normalized_email)
            except HTTPException as email_error:
                logger.exception(
                    "Unsubscribed from newsletter but confirmation email failed: %s",
                    email_error.detail,
                )

            # Notify company (non-critical)
            _send_newsletter_unsubscribe_notification_email(normalized_email)

        return HTMLResponse(
            content="""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Unsubscribed — Puget Sound Plumbing and Heating</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#fff;font-family:'Open Sans',sans-serif;color:#2B2B2B}
  .card{max-width:480px;width:90%;text-align:center;padding:48px 24px}
  .card img{max-width:260px;width:100%;margin-bottom:32px}
  .icon{width:56px;height:56px;margin:0 auto 16px;background:#e6f4ea;border-radius:50%;display:flex;align-items:center;justify-content:center}
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
  <img src="https://d1fyhmg0o2pfye.cloudfront.net/public/pspah-logo.png" alt="Puget Sound Plumbing and Heating"/>
  <div class="icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>
  <h1>You've Been Unsubscribed</h1>
  <p>You will no longer receive newsletter emails from us. If this was a mistake, you can subscribe again on our website.</p>
  <a class="btn" href="https://pugetsoundplumbingandheating.com">Back to Home</a>
  <p class="meta">Puget Sound Plumbing and Heating &middot; 11803 Des Moines Memorial Dr S, Burien, WA 98168</p>
</div>
</body>
</html>""",
            status_code=200,
        )
    except Exception as e:
        _raise_internal_api_error("unsubscribe_newsletter failed", e)


@router.post("/redeem-offer")
async def redeem_offer(request: RedeemOfferRequest, req: Request):
    """Send coupon confirmation, persist redemption, then notify company."""
    # Check rate limit
    client_ip = _get_client_ip(req)
    is_allowed, rate_limit_msg = check_rate_limit(client_ip, "redeem-offer")
    if not is_allowed:
        raise HTTPException(status_code=429, detail=rate_limit_msg)
    
    # Verify captcha token
    if not _verify_captcha(request.captchaToken):
        raise HTTPException(
            status_code=403,
            detail="Security verification failed. Please try again.",
        )

    first_name = _normalize_text(request.firstName)
    last_name = _normalize_text(request.lastName)
    email = _normalize_email(request.email)
    phone = _normalize_text(request.phone)
    coupon_id = _generate_coupon_id(request.couponDiscount)

    try:
        # Fast duplicate check so we avoid re-sending coupon emails for the same redemption.
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT 1
                    FROM "Redeemed Offers"
                    WHERE email = %s
                      AND phone = %s
                      AND coupon_discount = %s
                      AND coupon_condition = %s
                    LIMIT 1
                    """,
                    (email, phone, request.couponDiscount, request.couponCondition),
                )
                if cur.fetchone():
                    return _duplicate_response(
                        "This coupon request already exists for this contact. Please check your email for your coupon."
                    )

        # 1) Send coupon email to customer first.
        _send_coupon_confirmation_email(
            email,
            first_name,
            coupon_id,
            request.couponDiscount,
            request.couponCondition,
        )

        # 2) Persist the redemption in Supabase.
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                try:
                    cur.execute(
                        """
                        INSERT INTO "Redeemed Offers"
                            (first_name, last_name, email, phone, coupon_id, coupon_discount, coupon_condition)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        """,
                        (
                            first_name,
                            last_name,
                            email,
                            phone,
                            coupon_id,
                            request.couponDiscount,
                            request.couponCondition,
                        ),
                    )
                except Exception as insert_error:
                    if _is_duplicate_error(insert_error):
                        conn.rollback()
                        return _duplicate_response(
                            "This coupon request already exists for this contact. Please check your email for your coupon."
                        )
                    raise
            conn.commit()

        # 3) Notify the company after customer + DB steps complete.
        _send_coupon_redemption_notification_email(
            email,
            first_name,
            last_name,
            phone,
            coupon_id,
            request.couponDiscount,
            request.couponCondition,
        )

        return {"success": True, "emailStatus": "sent"}
    except HTTPException as e:
        raise e
    except Exception as e:
        _raise_internal_api_error("redeem_offer failed", e)


@router.post("/diy-permit")
async def submit_diy_permit(request: DiyPermitRequest, req: Request):
    """Insert DIY permit request into DB and send confirmation email"""
    # Check rate limit
    client_ip = _get_client_ip(req)
    is_allowed, rate_limit_msg = check_rate_limit(client_ip, "diy-permit")
    if not is_allowed:
        raise HTTPException(status_code=429, detail=rate_limit_msg)
    
    # Verify captcha token
    if not _verify_captcha(request.captchaToken):
        raise HTTPException(
            status_code=403,
            detail="Security verification failed. Please try again.",
        )

    first_name = _normalize_text(request.firstName)
    last_name = _normalize_text(request.lastName)
    email = _normalize_email(request.email)
    phone = _normalize_text(request.phone)
    address = _normalize_text(request.address)

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                try:
                    cur.execute(
                        """
                        INSERT INTO "DIY Permit Requests"
                            (first_name, last_name, email, phone, address, city, state, zip_code, project_description, inspection)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """,
                        (
                            first_name,
                            last_name,
                            email,
                            phone,
                            address,
                            request.city.strip(),
                            request.state.strip(),
                            request.zipCode.strip(),
                            request.projectDescription.strip(),
                            request.inspection,
                        ),
                    )
                except Exception as insert_error:
                    if _is_duplicate_error(insert_error):
                        conn.rollback()
                        return _duplicate_response(
                            "A DIY permit request already exists for this contact and address. We will be in touch soon."
                        )
                    raise
            conn.commit()

        try:
            _send_diy_permit_email(email, first_name, last_name, phone, address, request.city.strip(), request.state.strip(), request.zipCode.strip(), request.projectDescription.strip(), request.inspection)
            return {"success": True, "emailStatus": "sent"}
        except HTTPException as email_error:
            logger.exception("DIY permit saved but email failed: %s", email_error.detail)
            return {
                "success": True,
                "emailStatus": "failed",
                "message": "Request saved, but confirmation email could not be sent.",
            }
    except Exception as e:
        _raise_internal_api_error("submit_diy_permit failed", e)


@router.post("/job-application")
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
    req: Request = None,
):
    """Insert job application into DB, email resume to company, send confirmation to applicant"""
    # Check rate limit
    client_ip = _get_client_ip(req)
    is_allowed, rate_limit_msg = check_rate_limit(client_ip, "job-application")
    if not is_allowed:
        raise HTTPException(status_code=429, detail=rate_limit_msg)
    
    # Verify captcha token
    if not _verify_captcha(captchaToken):
        raise HTTPException(
            status_code=403,
            detail="Security verification failed. Please try again.",
        )

    normalized_first_name = _normalize_text(firstName)
    normalized_last_name = _normalize_text(lastName)
    normalized_phone = _normalize_text(phone)
    normalized_email = _normalize_email(email)
    normalized_position = _normalize_text(position)
    normalized_experience = experience.strip()
    normalized_message = message.strip()
    normalized_additional_info = additionalInfo.strip()

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
                        (
                            normalized_first_name,
                            normalized_last_name,
                            normalized_email,
                            normalized_phone,
                            normalized_position,
                        ),
                    )
                except Exception as insert_error:
                    if _is_duplicate_error(insert_error):
                        conn.rollback()
                        return _duplicate_response(
                            "A job application already exists for this email and position. Our team will follow up if needed."
                        )
                    raise
            conn.commit()

        resume_bytes = None
        resume_filename = None
        resume_s3_key = None
        if resume:
            resume_bytes = await resume.read()
            resume_filename = resume.filename
            # Upload resume to resumes/ prefix in the main S3 bucket
            resume_s3_key = s3_service.upload_resume(resume_bytes, resume_filename)
            if not resume_s3_key:
                logger.warning(f"Failed to upload resume {resume_filename} to S3, will attach to email anyway")

        try:
            _send_job_application_email(
                normalized_email,
                normalized_first_name,
                normalized_last_name,
                normalized_position,
                resume_bytes,
                resume_filename,
            )
            return {"success": True, "emailStatus": "sent"}
        except HTTPException as email_error:
            logger.exception("Application saved but email notification failed: %s", email_error.detail)
            return {
                "success": True,
                "emailStatus": "failed",
                "message": "Application saved, but email notification could not be sent.",
            }
    except Exception as e:
        _raise_internal_api_error("submit_job_application failed", e)


def _send_followup_email(email: str, firstName: str):
    """Internal helper – send the follow-up confirmation email."""
    try:
        resend.Emails.send(
            {
                "from": f"Puget Sound Plumbing and Heating <{EMAIL_FROM}>",
                "to": email,
                "subject": "We Received Your Request — Puget Sound Plumbing and Heating",
                "html": f"""<!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                </head>
                <body style="margin:0;padding:0;background-color:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;padding:48px 0;">
                    <tr>
                    <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:6px;overflow:hidden;">

                        <!-- Logo -->
                        <tr>
                            <td style="padding:40px 40px 32px;text-align:center;">
                            <img
                                src="https://d1fyhmg0o2pfye.cloudfront.net/public/pspah-logo.png"
                                alt="Puget Sound Plumbing and Heating"
                                width="300"
                                style="display:block;margin:0 auto;"
                            />
                            </td>
                        </tr>

                        <!-- Divider -->
                        <tr><td style="padding:0 40px;"><div style="border-top:1px solid #e5e5e5;"></div></td></tr>

                        <!-- Greeting -->
                        <tr>
                            <td style="padding:36px 40px 20px;">
                            <h1 style="margin:0 0 12px;font-size:21px;font-weight:700;color:#0C2D70;">Thank You, {firstName}!</h1>
                            <p style="margin:0;font-size:15px;line-height:1.75;color:#555555;">
                                We've received your service request and appreciate you reaching out to
                                <strong style="color:#2B2B2B;">Puget Sound Plumbing and Heating</strong>.
                                A member of our team will reach out to you by phone to get your
                                appointment scheduled at a time that works best for you.
                            </p>
                            </td>
                        </tr>

                        <!-- What Happens Next -->
                        <tr>
                            <td style="padding:4px 40px 28px;">
                            <p style="margin:0 0 16px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#999999;">What Happens Next</p>
                            <table cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                <td style="padding:10px 0;border-top:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0"><tr>
                                    <td style="width:28px;font-size:13px;font-weight:700;color:#B32020;vertical-align:top;padding-top:1px;">1.</td>
                                    <td style="font-size:14px;color:#555555;line-height:1.6;">Our team reviews your request and prepares for your call.</td>
                                    </tr></table>
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:10px 0;border-top:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0"><tr>
                                    <td style="width:28px;font-size:13px;font-weight:700;color:#B32020;vertical-align:top;padding-top:1px;">2.</td>
                                    <td style="font-size:14px;color:#555555;line-height:1.6;">A representative calls you to discuss your needs and schedule a convenient visit.</td>
                                    </tr></table>
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:10px 0;border-top:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0"><tr>
                                    <td style="width:28px;font-size:13px;font-weight:700;color:#B32020;vertical-align:top;padding-top:1px;">3.</td>
                                    <td style="font-size:14px;color:#555555;line-height:1.6;">A licensed technician arrives at your home, fully equipped and ready to help.</td>
                                    </tr></table>
                                </td>
                                </tr>
                            </table>
                            </td>
                        </tr>

                        <!-- Contact blurb -->
                        <tr>
                            <td style="padding:0 40px 32px;">
                            <p style="margin:0;font-size:14px;line-height:1.75;color:#555555;">
                                Need immediate help? We're available
                                <strong style="color:#2B2B2B;">24 hours a day, 7 days a week</strong>.<br/>
                                <span style="font-size:13px;color:#888888;">11803 Des Moines Memorial Dr S, Burien, WA 98168</span>
                            </p>
                            </td>
                        </tr>

                        <!-- CTA -->
                        <tr>
                            <td style="padding:0 40px 44px;text-align:center;">
                            <a
                                href="tel:+12069383219"
                                style="display:inline-block;background-color:#B32020;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 36px;border-radius:3px;letter-spacing:0.05em;"
                            >CALL (206) 938-3219</a>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color:#f8f8f8;border-top:1px solid #e5e5e5;padding:20px 40px;text-align:center;">
                            <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#0C2D70;">Puget Sound Plumbing and Heating</p>
                            <p style="margin:0 0 10px;font-size:11px;color:#aaaaaa;">Licensed &amp; Insured &nbsp;&middot;&nbsp; Serving Greater Seattle Since 1984</p>
                            <p style="margin:0;font-size:11px;color:#bbbbbb;line-height:1.6;">
                                This automated email was sent because you submitted a service request on our website.<br/>
                                Please do not reply — call us at (206) 938-3219 for immediate help.
                            </p>
                            </td>
                        </tr>

                        </table>
                    </td>
                    </tr>
                </table>
                </body>
                </html>""",
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Email send failed for sender '{EMAIL_FROM}': {str(e)}",
        )


def _send_schedule_notification_email(email: str, firstName: str, lastName: str, phone: str, message: str):
    """Internal helper – notify the business owner of a new schedule request."""
    try:
        resend.Emails.send(
            {
                "from": f"Puget Sound Plumbing and Heating <{EMAIL_FROM}>",
                "to": COMPANY_EMAIL,
                "subject": f"New Service Request — {firstName} {lastName}",
                "html": f"""<!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                </head>
                <body style="margin:0;padding:0;background-color:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;padding:48px 0;">
                    <tr>
                    <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:6px;overflow:hidden;">

                        <!-- Logo -->
                        <tr>
                            <td style="padding:40px 40px 32px;text-align:center;">
                            <img
                                src="https://d1fyhmg0o2pfye.cloudfront.net/public/pspah-logo.png"
                                alt="Puget Sound Plumbing and Heating"
                                width="300"
                                style="display:block;margin:0 auto;"
                            />
                            </td>
                        </tr>

                        <!-- Divider -->
                        <tr><td style="padding:0 40px;"><div style="border-top:1px solid #e5e5e5;"></div></td></tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding:36px 40px 28px;">
                            <h2 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0C2D70;">New Service Request</h2>
                            <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
                                <tr>
                                <td style="padding:10px 0;border-top:1px solid #eeeeee;border-bottom:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0" width="100%"><tr>
                                    <td style="width:140px;font-size:13px;font-weight:700;color:#0C2D70;vertical-align:top;padding-right:16px;">Name:</td>
                                    <td style="font-size:14px;color:#2B2B2B;">{firstName} {lastName}</td>
                                    </tr></table>
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:10px 0;border-bottom:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0" width="100%"><tr>
                                    <td style="width:140px;font-size:13px;font-weight:700;color:#0C2D70;vertical-align:top;padding-right:16px;">Email:</td>
                                    <td style="font-size:14px;color:#2B2B2B;">{email}</td>
                                    </tr></table>
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:10px 0;border-bottom:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0" width="100%"><tr>
                                    <td style="width:140px;font-size:13px;font-weight:700;color:#0C2D70;vertical-align:top;padding-right:16px;">Phone:</td>
                                    <td style="font-size:14px;color:#2B2B2B;">{phone}</td>
                                    </tr></table>
                                </td>
                                </tr>
                                {"<tr><td style=\"padding:10px 0;border-bottom:1px solid #eeeeee;\"><table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\"><tr><td style=\"width:140px;font-size:13px;font-weight:700;color:#0C2D70;vertical-align:top;padding-right:16px;\">Message:</td><td style=\"font-size:14px;color:#2B2B2B;\">" + message + "</td></tr></table></td></tr>" if message else ""}
                            </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color:#f8f8f8;border-top:1px solid #e5e5e5;padding:20px 40px;text-align:center;">
                            <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#0C2D70;">Puget Sound Plumbing and Heating</p>
                            <p style="margin:0;font-size:11px;color:#aaaaaa;">Schedule Online Request Alert</p>
                            </td>
                        </tr>

                        </table>
                    </td>
                    </tr>
                </table>
                </body>
                </html>""",
            }
        )
    except Exception:
        # Company notification failure is non-critical; customer already confirmed
        logger.exception("Company schedule request notification email failed")


def _send_newsletter_confirmation_email(email: str, unsubscribe_url: str):
    """Internal helper – send the newsletter confirmation email with unsubscribe button."""
    try:
        resend.Emails.send(
            {
                "from": f"Puget Sound Plumbing and Heating <{EMAIL_FROM}>",
                "to": email,
                "subject": "You're Subscribed — Puget Sound Plumbing and Heating",
                "html": f"""<!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                </head>
                <body style="margin:0;padding:0;background-color:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;padding:48px 0;">
                    <tr>
                    <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:6px;overflow:hidden;">

                        <tr>
                            <td style="padding:40px 40px 32px;text-align:center;">
                            <img
                                src="https://d1fyhmg0o2pfye.cloudfront.net/public/pspah-logo.png"
                                alt="Puget Sound Plumbing and Heating"
                                width="300"
                                style="display:block;margin:0 auto;"
                            />
                            </td>
                        </tr>

                        <tr><td style="padding:0 40px;"><div style="border-top:1px solid #e5e5e5;"></div></td></tr>

                        <tr>
                            <td style="padding:36px 40px 20px;">
                            <h1 style="margin:0 0 12px;font-size:21px;font-weight:700;color:#0C2D70;">Thank You for Subscribing!</h1>
                            <p style="margin:0;font-size:15px;line-height:1.75;color:#555555;">
                                You're officially on the Puget Sound Plumbing and Heating mailing list.
                                We'll send seasonal maintenance tips, occasional promotions, and company updates.
                            </p>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:4px 40px 28px;">
                            <p style="margin:0 0 16px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#999999;">What Happens Next</p>
                            <table cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                <td style="padding:10px 0;border-top:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0"><tr>
                                    <td style="width:28px;font-size:13px;font-weight:700;color:#B32020;vertical-align:top;padding-top:1px;">1.</td>
                                    <td style="font-size:14px;color:#555555;line-height:1.6;">You'll receive useful plumbing and heating tips for the Puget Sound area.</td>
                                    </tr></table>
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:10px 0;border-top:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0"><tr>
                                    <td style="width:28px;font-size:13px;font-weight:700;color:#B32020;vertical-align:top;padding-top:1px;">2.</td>
                                    <td style="font-size:14px;color:#555555;line-height:1.6;">You'll get access to occasional limited-time promotions and offers.</td>
                                    </tr></table>
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:10px 0;border-top:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0"><tr>
                                    <td style="width:28px;font-size:13px;font-weight:700;color:#B32020;vertical-align:top;padding-top:1px;">3.</td>
                                    <td style="font-size:14px;color:#555555;line-height:1.6;">You can unsubscribe anytime using the button below.</td>
                                    </tr></table>
                                </td>
                                </tr>
                            </table>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:0 40px 32px;">
                            <p style="margin:0;font-size:14px;line-height:1.75;color:#555555;">
                                Need immediate plumbing help? We're available
                                <strong style="color:#2B2B2B;">24 hours a day, 7 days a week</strong>.<br/>
                                <span style="font-size:13px;color:#888888;">11803 Des Moines Memorial Dr S, Burien, WA 98168</span>
                            </p>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:0 40px 16px;text-align:center;">
                            <a
                                href="tel:+12069383219"
                                style="display:inline-block;background-color:#B32020;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 36px;border-radius:3px;letter-spacing:0.05em;"
                            >CALL (206) 938-3219</a>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:0 40px 44px;text-align:center;">
                            </td>
                        </tr>

                        <tr>
                            <td style="background-color:#f8f8f8;border-top:1px solid #e5e5e5;padding:20px 40px;text-align:center;">
                            <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#0C2D70;">Puget Sound Plumbing and Heating</p>
                            <p style="margin:0 0 10px;font-size:11px;color:#aaaaaa;">Licensed &amp; Insured &nbsp;&middot;&nbsp; Serving Greater Seattle Since 1984</p>
                            <p style="margin:0 0 8px;font-size:11px;color:#bbbbbb;line-height:1.6;">
                                This automated email was sent because you joined our mailing list on our website.<br/>
                                Please do not reply — call us at (206) 938-3219 for immediate help.
                            </p>
                            <a href="{unsubscribe_url}" style="font-size:10px;color:#cccccc;text-decoration:underline;">Unsubscribe</a>
                            </td>
                        </tr>

                        </table>
                    </td>
                    </tr>
                </table>
                </body>
                </html>""",
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Newsletter confirmation email failed for sender '{EMAIL_FROM}': {str(e)}",
        )


def _send_newsletter_unsubscribe_confirmation_email(email: str):
    """Internal helper – send confirmation after newsletter unsubscribe."""
    try:
        resend.Emails.send(
            {
                "from": f"Puget Sound Plumbing and Heating <{EMAIL_FROM}>",
                "to": email,
                "subject": "You've Been Unsubscribed — Puget Sound Plumbing and Heating",
                "html": """<!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                </head>
                <body style="margin:0;padding:0;background-color:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;padding:48px 0;">
                    <tr>
                    <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:6px;overflow:hidden;">

                        <tr>
                            <td style="padding:40px 40px 32px;text-align:center;">
                            <img
                                src="https://d1fyhmg0o2pfye.cloudfront.net/public/pspah-logo.png"
                                alt="Puget Sound Plumbing and Heating"
                                width="300"
                                style="display:block;margin:0 auto;"
                            />
                            </td>
                        </tr>

                        <tr><td style="padding:0 40px;"><div style="border-top:1px solid #e5e5e5;"></div></td></tr>

                        <tr>
                            <td style="padding:36px 40px 20px;">
                            <h1 style="margin:0 0 12px;font-size:21px;font-weight:700;color:#0C2D70;">You're Unsubscribed</h1>
                            <p style="margin:0;font-size:15px;line-height:1.75;color:#555555;">
                                Your email address has been removed from our mailing list and you will no longer receive newsletter messages.
                            </p>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:0 40px 32px;">
                            <p style="margin:0;font-size:14px;line-height:1.75;color:#555555;">
                                Need immediate plumbing help? We're available
                                <strong style="color:#2B2B2B;">24 hours a day, 7 days a week</strong>.<br/>
                                <span style="font-size:13px;color:#888888;">11803 Des Moines Memorial Dr S, Burien, WA 98168</span>
                            </p>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:0 40px 44px;text-align:center;">
                            <a
                                href="tel:+12069383219"
                                style="display:inline-block;background-color:#B32020;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 36px;border-radius:3px;letter-spacing:0.05em;"
                            >CALL (206) 938-3219</a>
                            </td>
                        </tr>

                        <tr>
                            <td style="background-color:#f8f8f8;border-top:1px solid #e5e5e5;padding:20px 40px;text-align:center;">
                            <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#0C2D70;">Puget Sound Plumbing and Heating</p>
                            <p style="margin:0 0 10px;font-size:11px;color:#aaaaaa;">Licensed &amp; Insured &nbsp;&middot;&nbsp; Serving Greater Seattle Since 1984</p>
                            <p style="margin:0;font-size:11px;color:#bbbbbb;line-height:1.6;">
                                This automated email confirms your newsletter unsubscribe request.
                            </p>
                            </td>
                        </tr>

                        </table>
                    </td>
                    </tr>
                </table>
                </body>
                </html>""",
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Newsletter unsubscribe confirmation email failed for sender '{EMAIL_FROM}': {str(e)}",
        )


def _send_newsletter_notification_email(email: str):
    """Internal helper – notify the business owner of a new newsletter subscription."""
    try:
        resend.Emails.send(
            {
                "from": f"Puget Sound Plumbing and Heating <{EMAIL_FROM}>",
                "to": COMPANY_EMAIL,
                "subject": f"New Newsletter Subscriber — {email}",
                "html": f"""<!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                </head>
                <body style="margin:0;padding:0;background-color:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;padding:48px 0;">
                    <tr>
                    <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:6px;overflow:hidden;">

                        <!-- Logo -->
                        <tr>
                            <td style="padding:40px 40px 32px;text-align:center;">
                            <img
                                src="https://d1fyhmg0o2pfye.cloudfront.net/public/pspah-logo.png"
                                alt="Puget Sound Plumbing and Heating"
                                width="300"
                                style="display:block;margin:0 auto;"
                            />
                            </td>
                        </tr>

                        <!-- Divider -->
                        <tr><td style="padding:0 40px;"><div style="border-top:1px solid #e5e5e5;"></div></td></tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding:36px 40px 28px;">
                            <h2 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0C2D70;">New Newsletter Subscriber</h2>
                            <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
                                <tr>
                                <td style="padding:10px 0;border-top:1px solid #eeeeee;border-bottom:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0" width="100%"><tr>
                                    <td style="width:140px;font-size:13px;font-weight:700;color:#0C2D70;vertical-align:top;padding-right:16px;">Email:</td>
                                    <td style="font-size:14px;color:#2B2B2B;">{email}</td>
                                    </tr></table>
                                </td>
                                </tr>
                            </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color:#f8f8f8;border-top:1px solid #e5e5e5;padding:20px 40px;text-align:center;">
                            <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#0C2D70;">Puget Sound Plumbing and Heating</p>
                            <p style="margin:0;font-size:11px;color:#aaaaaa;">Newsletter Subscription Alert</p>
                            </td>
                        </tr>

                        </table>
                    </td>
                    </tr>
                </table>
                </body>
                </html>""",
            }
        )
    except Exception:
        # Company notification failure is non-critical; subscriber already confirmed
        logger.exception("Company newsletter subscription notification email failed")


def _send_newsletter_unsubscribe_notification_email(email: str):
    """Internal helper – notify the business owner of a newsletter unsubscribe."""
    try:
        resend.Emails.send(
            {
                "from": f"Puget Sound Plumbing and Heating <{EMAIL_FROM}>",
                "to": COMPANY_EMAIL,
                "subject": f"Newsletter Unsubscribe — {email}",
                "html": f"""<!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                </head>
                <body style="margin:0;padding:0;background-color:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;padding:48px 0;">
                    <tr>
                    <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:6px;overflow:hidden;">

                        <!-- Logo -->
                        <tr>
                            <td style="padding:40px 40px 32px;text-align:center;">
                            <img
                                src="https://d1fyhmg0o2pfye.cloudfront.net/public/pspah-logo.png"
                                alt="Puget Sound Plumbing and Heating"
                                width="300"
                                style="display:block;margin:0 auto;"
                            />
                            </td>
                        </tr>

                        <!-- Divider -->
                        <tr><td style="padding:0 40px;"><div style="border-top:1px solid #e5e5e5;"></div></td></tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding:36px 40px 28px;">
                            <h2 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0C2D70;">Newsletter Unsubscribe</h2>
                            <p style="margin:0 0 20px;font-size:14px;line-height:1.75;color:#555555;">The following email has unsubscribed from the newsletter mailing list:</p>
                            <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
                                <tr>
                                <td style="padding:10px 0;border-top:1px solid #eeeeee;border-bottom:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0" width="100%"><tr>
                                    <td style="width:140px;font-size:13px;font-weight:700;color:#0C2D70;vertical-align:top;padding-right:16px;">Email:</td>
                                    <td style="font-size:14px;color:#2B2B2B;">{email}</td>
                                    </tr></table>
                                </td>
                                </tr>
                            </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color:#f8f8f8;border-top:1px solid #e5e5e5;padding:20px 40px;text-align:center;">
                            <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#0C2D70;">Puget Sound Plumbing and Heating</p>
                            <p style="margin:0;font-size:11px;color:#aaaaaa;">Newsletter Unsubscribe Alert</p>
                            </td>
                        </tr>

                        </table>
                    </td>
                    </tr>
                </table>
                </body>
                </html>""",
            }
        )
    except Exception:
        # Company notification failure is non-critical; subscriber already unsubscribed
        logger.exception("Company newsletter unsubscribe notification email failed")


def _send_coupon_confirmation_email(
    email: str,
    firstName: str,
    couponId: str,
    couponDiscount: str,
    couponCondition: str,
):
    """Send coupon confirmation email to the customer."""
    try:
        resend.Emails.send(
            {
                "from": f"Puget Sound Plumbing and Heating <{EMAIL_FROM}>",
                "to": email,
                "subject": f"Your Coupon: {couponDiscount} — Puget Sound Plumbing and Heating",
                "html": f"""<!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                </head>
                <body style="margin:0;padding:0;background-color:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;padding:48px 0;">
                    <tr>
                    <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:6px;overflow:hidden;">

                        <!-- Logo -->
                        <tr>
                            <td style="padding:40px 40px 32px;text-align:center;">
                            <img
                                src="https://d1fyhmg0o2pfye.cloudfront.net/public/pspah-logo.png"
                                alt="Puget Sound Plumbing and Heating"
                                width="300"
                                style="display:block;margin:0 auto;"
                            />
                            </td>
                        </tr>

                        <!-- Divider -->
                        <tr><td style="padding:0 40px;"><div style="border-top:1px solid #e5e5e5;"></div></td></tr>

                        <!-- Greeting -->
                        <tr>
                            <td style="padding:36px 40px 20px;">
                            <h1 style="margin:0 0 12px;font-size:21px;font-weight:700;color:#0C2D70;">Here's Your Coupon, {firstName}!</h1>
                            <p style="margin:0;font-size:15px;line-height:1.75;color:#555555;">
                                Save this email and mention your coupon when you call to schedule your service.
                                Must be presented at the time of booking — one coupon per customer.
                            </p>
                            </td>
                        </tr>

                        <!-- Coupon Card -->
                        <tr>
                            <td style="padding:4px 40px 36px;">
                            <table cellpadding="0" cellspacing="0" style="width:420px;margin:0 auto;border:4px dashed #B32020;background-color:#ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.12);position:relative;">
                                <tr>
                                <td style="width:420px;padding:24px 32px;text-align:center;vertical-align:middle;">
                                    <!-- Coupon icon badge with ID -->
                                    <table cellpadding="0" cellspacing="0" style="margin:0 auto 14px;border-radius:4px;overflow:hidden;">
                                    <tr>
                                    <td style="background-color:#B32020;padding:8px 10px 8px 14px;vertical-align:middle;">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="22" height="22" fill="#ffffff" style="display:block;">
                                    <path d="M0 252.118V48C0 21.49 21.49 0 48 0h204.118a48 48 0 0 1 33.941 14.059l211.882 211.882c18.745 18.745 18.745 49.137 0 67.882L293.823 497.941c-18.745 18.745-49.137 18.745-67.882 0L14.059 286.059A48 48 0 0 1 0 252.118zM112 64c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48z"/>
                                    </svg>
                                    </td>
                                    <td style="background-color:#B32020;padding:8px 14px 8px 6px;vertical-align:middle;font-size:13px;font-weight:700;color:#ffffff;letter-spacing:0.05em;white-space:nowrap;">
                                    {couponId}
                                    </td>
                                    </tr>
                                    </table>
                                    <!-- Discount amount with red underline -->
                                    <table cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">
                                    <tr>
                                        <td style="font-size:26px;font-weight:700;color:#0C2D70;text-transform:uppercase;border-bottom:4px solid #B32020;padding-bottom:6px;text-align:center;white-space:nowrap;letter-spacing:0.04em;">
                                        {couponDiscount}
                                        </td>
                                    </tr>
                                    </table>
                                    <!-- Condition -->
                                    <p style="font-size:14px;font-weight:600;color:#2B2B2B;text-transform:uppercase;margin:0 0 8px;letter-spacing:0.03em;">{couponCondition}</p>
                                    <!-- Fine print -->
                                    <p style="font-size:11px;color:#555555;margin:0;">Cannot be combined with other offers.</p>
                                </td>
                                <!-- Scissors icon (FaCut SVG) -->
                                <td style="width:32px;vertical-align:bottom;padding-bottom:40px;padding-right:0;">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="24" height="24" fill="#B32020" style="display:block;transform:rotate(270deg);">
                                    <path d="M278.06 256L444.48 89.57c4.69-4.69 4.69-12.29 0-16.97-32.8-32.8-85.99-32.8-118.79 0L210.18 188.12l-24.86-24.86c4.31-10.92 6.68-22.81 6.68-35.26 0-53.02-42.98-96-96-96S0 74.98 0 128s42.98 96 96 96c12.45 0 24.34-2.37 35.27-6.68l24.85 24.85-24.85 24.86C120.34 262.37 108.45 260 96 260c-53.02 0-96 42.98-96 96s42.98 96 96 96c53.02 0 96-42.98 96-96 0-12.45-2.37-24.34-6.68-35.27l24.86-24.85L325.69 411.4c32.8 32.8 85.99 32.8 118.79 0 4.69-4.68 4.69-12.28 0-16.97L278.06 256zM96 160c-17.64 0-32-14.36-32-32s14.36-32 32-32 32 14.36 32 32-14.36 32-32 32zm0 256c-17.64 0-32-14.36-32-32s14.36-32 32-32 32 14.36 32 32-14.36 32-32 32z"/>
                                    </svg>
                                </td>
                                </tr>
                            </table>
                            </td>
                        </tr>

                        <!-- CTA -->
                        <tr>
                            <td style="padding:0 40px 44px;text-align:center;">
                            <p style="margin:0 0 20px;font-size:14px;line-height:1.75;color:#555555;">
                                Ready to schedule? Give us a call — we're available
                                <strong style="color:#2B2B2B;">24 hours a day, 7 days a week</strong>.
                            </p>
                            <a
                                href="tel:+12069383219"
                                style="display:inline-block;background-color:#B32020;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 36px;border-radius:3px;letter-spacing:0.05em;"
                            >CALL (206) 938-3219</a>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color:#f8f8f8;border-top:1px solid #e5e5e5;padding:20px 40px;text-align:center;">
                            <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#0C2D70;">Puget Sound Plumbing and Heating</p>
                            <p style="margin:0 0 10px;font-size:11px;color:#aaaaaa;">Licensed &amp; Insured &nbsp;&middot;&nbsp; Serving Greater Seattle Since 1984</p>
                            <p style="margin:0;font-size:11px;color:#bbbbbb;line-height:1.6;">
                                This coupon was sent because you submitted a redemption request on our website.<br/>
                                11803 Des Moines Memorial Dr S, Burien, WA 98168
                            </p>
                            </td>
                        </tr>

                        </table>
                    </td>
                    </tr>
                </table>
                </body>
                </html>""",
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Coupon email send failed for sender '{EMAIL_FROM}': {str(e)}",
        )


def _send_coupon_redemption_notification_email(
    email: str,
    firstName: str,
    lastName: str,
    phone: str,
    couponId: str,
    couponDiscount: str,
    couponCondition: str,
):
    """Send coupon redemption notification email to the company."""
    try:
        resend.Emails.send(
            {
                "from": f"Puget Sound Plumbing and Heating <{EMAIL_FROM}>",
                "to": COMPANY_EMAIL,
                "subject": f"New Coupon Redemption: {couponId} ({couponDiscount}) — {firstName} {lastName}",
                "html": f"""<!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                </head>
                <body style="margin:0;padding:0;background-color:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;padding:48px 0;">
                    <tr>
                    <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:6px;overflow:hidden;">

                        <!-- Logo -->
                        <tr>
                            <td style="padding:40px 40px 32px;text-align:center;">
                            <img
                                src="https://d1fyhmg0o2pfye.cloudfront.net/public/pspah-logo.png"
                                alt="Puget Sound Plumbing and Heating"
                                width="300"
                                style="display:block;margin:0 auto;"
                            />
                            </td>
                        </tr>

                        <!-- Divider -->
                        <tr><td style="padding:0 40px;"><div style="border-top:1px solid #e5e5e5;"></div></td></tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding:36px 40px 24px;">
                            <h2 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0C2D70;">New Coupon Redemption</h2>
                            <table cellpadding="0" cellspacing="0" width="100%" style="margin:0;">
                                <tr>
                                <td style="padding:10px 0;border-top:1px solid #eeeeee;border-bottom:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0" width="100%"><tr>
                                    <td style="width:140px;font-size:13px;font-weight:700;color:#0C2D70;vertical-align:top;padding-right:16px;">Name:</td>
                                    <td style="font-size:14px;color:#2B2B2B;">{firstName} {lastName}</td>
                                    </tr></table>
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:10px 0;border-bottom:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0" width="100%"><tr>
                                    <td style="width:140px;font-size:13px;font-weight:700;color:#0C2D70;vertical-align:top;padding-right:16px;">Email:</td>
                                    <td style="font-size:14px;color:#2B2B2B;">{email}</td>
                                    </tr></table>
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:10px 0;border-bottom:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0" width="100%"><tr>
                                    <td style="width:140px;font-size:13px;font-weight:700;color:#0C2D70;vertical-align:top;padding-right:16px;">Phone:</td>
                                    <td style="font-size:14px;color:#2B2B2B;">{phone}</td>
                                    </tr></table>
                                </td>
                                </tr>
                            </table>
                            </td>
                        </tr>

                        <!-- Coupon Card -->
                        <tr>
                            <td style="padding:0 40px 32px;">
                            <table cellpadding="0" cellspacing="0" style="width:420px;max-width:100%;margin:0 auto;border:4px dashed #B32020;background-color:#ffffff;">
                                <tr>
                                <td style="padding:22px 20px;text-align:center;">
                                    <table cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">
                                    <tr>
                                    <td style="background-color:#B32020;padding:8px 14px;font-size:12px;font-weight:700;color:#ffffff;letter-spacing:0.06em;white-space:nowrap;">
                                        COUPON ID: {couponId}
                                    </td>
                                    </tr>
                                    </table>
                                    <p style="margin:0 0 10px;font-size:25px;font-weight:700;color:#0C2D70;text-transform:uppercase;letter-spacing:0.04em;">{couponDiscount}</p>
                                    <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#2B2B2B;text-transform:uppercase;letter-spacing:0.03em;">{couponCondition}</p>
                                    <p style="margin:0;font-size:11px;color:#555555;">Cannot be combined with other offers.</p>
                                </td>
                                </tr>
                            </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color:#f8f8f8;border-top:1px solid #e5e5e5;padding:20px 40px;text-align:center;">
                            <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#0C2D70;">Puget Sound Plumbing and Heating</p>
                            <p style="margin:0;font-size:11px;color:#aaaaaa;">Coupon Redemption Alert</p>
                            </td>
                        </tr>

                        </table>
                    </td>
                    </tr>
                </table>
                </body>
                </html>""",
            }
        )
    except Exception:
        # Company notification failure is non-critical; customer already confirmed
        logger.exception("Company coupon redemption notification email failed")


def _send_diy_permit_email(email: str, firstName: str, lastName: str, phone: str, address: str, city: str = "", state: str = "", zipCode: str = "", projectDescription: str = "", inspection: str = "unsure"):
    """Internal helper – send DIY permit confirmation to requester + company notification."""
    # 1. Confirmation to requester
    try:
        resend.Emails.send(
            {
                "from": f"Puget Sound Plumbing and Heating <{EMAIL_FROM}>",
                "to": email,
                "subject": "DIY Permit Request Received — Puget Sound Plumbing and Heating",
                "html": f"""<!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                </head>
                <body style="margin:0;padding:0;background-color:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;padding:48px 0;">
                    <tr>
                    <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:6px;overflow:hidden;">

                        <!-- Logo -->
                        <tr>
                            <td style="padding:40px 40px 32px;text-align:center;">
                            <img
                                src="https://d1fyhmg0o2pfye.cloudfront.net/public/pspah-logo.png"
                                alt="Puget Sound Plumbing and Heating"
                                width="300"
                                style="display:block;margin:0 auto;"
                            />
                            </td>
                        </tr>

                        <!-- Divider -->
                        <tr><td style="padding:0 40px;"><div style="border-top:1px solid #e5e5e5;"></div></td></tr>

                        <!-- Greeting -->
                        <tr>
                            <td style="padding:36px 40px 20px;">
                            <h1 style="margin:0 0 12px;font-size:21px;font-weight:700;color:#0C2D70;">Request Received, {firstName}!</h1>
                            <p style="margin:0;font-size:15px;line-height:1.75;color:#555555;">
                                We've received your DIY plumbing permit request for
                                <strong style="color:#2B2B2B;">{address}</strong>.
                                A member of our team will review your project details and reach out
                                to help guide you through the permit process.
                            </p>
                            </td>
                        </tr>

                        <!-- What Happens Next -->
                        <tr>
                            <td style="padding:4px 40px 28px;">
                            <p style="margin:0 0 16px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#999999;">What Happens Next</p>
                            <table cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                <td style="padding:10px 0;border-top:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0"><tr>
                                    <td style="width:28px;font-size:13px;font-weight:700;color:#B32020;vertical-align:top;padding-top:1px;">1.</td>
                                    <td style="font-size:14px;color:#555555;line-height:1.6;">Our team reviews your project details and permit requirements.</td>
                                    </tr></table>
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:10px 0;border-top:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0"><tr>
                                    <td style="width:28px;font-size:13px;font-weight:700;color:#B32020;vertical-align:top;padding-top:1px;">2.</td>
                                    <td style="font-size:14px;color:#555555;line-height:1.6;">We contact you with guidance on the permit process and next steps.</td>
                                    </tr></table>
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:10px 0;border-top:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0"><tr>
                                    <td style="width:28px;font-size:13px;font-weight:700;color:#B32020;vertical-align:top;padding-top:1px;">3.</td>
                                    <td style="font-size:14px;color:#555555;line-height:1.6;">Your project proceeds safely and up to local code requirements.</td>
                                    </tr></table>
                                </td>
                                </tr>
                            </table>
                            </td>
                        </tr>

                        <!-- Contact blurb -->
                        <tr>
                            <td style="padding:0 40px 32px;">
                            <p style="margin:0;font-size:14px;line-height:1.75;color:#555555;">
                                Have questions in the meantime? We're available
                                <strong style="color:#2B2B2B;">24 hours a day, 7 days a week</strong>.<br/>
                                <span style="font-size:13px;color:#888888;">11803 Des Moines Memorial Dr S, Burien, WA 98168</span>
                            </p>
                            </td>
                        </tr>

                        <!-- CTA -->
                        <tr>
                            <td style="padding:0 40px 44px;text-align:center;">
                            <a
                                href="tel:+12069383219"
                                style="display:inline-block;background-color:#B32020;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 36px;border-radius:3px;letter-spacing:0.05em;"
                            >CALL (206) 938-3219</a>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color:#f8f8f8;border-top:1px solid #e5e5e5;padding:20px 40px;text-align:center;">
                            <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#0C2D70;">Puget Sound Plumbing and Heating</p>
                            <p style="margin:0 0 10px;font-size:11px;color:#aaaaaa;">Licensed &amp; Insured &nbsp;&middot;&nbsp; Serving Greater Seattle Since 1984</p>
                            <p style="margin:0;font-size:11px;color:#bbbbbb;line-height:1.6;">
                                This email was sent because you submitted a DIY permit request on our website.<br/>
                                Please do not reply — call us at (206) 938-3219 for immediate help.
                            </p>
                            </td>
                        </tr>

                        </table>
                    </td>
                    </tr>
                </table>
                </body>
                </html>""",
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"DIY permit email send failed for sender '{EMAIL_FROM}': {str(e)}",
        )

    # 2. Notification to company
    try:
        resend.Emails.send(
            {
                "from": f"Puget Sound Plumbing and Heating <{EMAIL_FROM}>",
                "to": COMPANY_EMAIL,
                "subject": f"New DIY Permit Request — {firstName} {lastName}",
                "html": f"""<!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                </head>
                <body style="margin:0;padding:0;background-color:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;padding:48px 0;">
                    <tr>
                    <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:6px;overflow:hidden;">

                        <!-- Logo -->
                        <tr>
                            <td style="padding:40px 40px 32px;text-align:center;">
                            <img
                                src="https://d1fyhmg0o2pfye.cloudfront.net/public/pspah-logo.png"
                                alt="Puget Sound Plumbing and Heating"
                                width="300"
                                style="display:block;margin:0 auto;"
                            />
                            </td>
                        </tr>

                        <!-- Divider -->
                        <tr><td style="padding:0 40px;"><div style="border-top:1px solid #e5e5e5;"></div></td></tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding:36px 40px 28px;">
                            <h2 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0C2D70;">New DIY Permit Request</h2>
                            <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
                                <tr>
                                <td style="padding:10px 0;border-top:1px solid #eeeeee;border-bottom:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0" width="100%"><tr>
                                    <td style="width:140px;font-size:13px;font-weight:700;color:#0C2D70;vertical-align:top;padding-right:16px;">Name:</td>
                                    <td style="font-size:14px;color:#2B2B2B;">{firstName} {lastName}</td>
                                    </tr></table>
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:10px 0;border-bottom:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0" width="100%"><tr>
                                    <td style="width:140px;font-size:13px;font-weight:700;color:#0C2D70;vertical-align:top;padding-right:16px;">Email:</td>
                                    <td style="font-size:14px;color:#2B2B2B;">{email}</td>
                                    </tr></table>
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:10px 0;border-bottom:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0" width="100%"><tr>
                                    <td style="width:140px;font-size:13px;font-weight:700;color:#0C2D70;vertical-align:top;padding-right:16px;">Phone:</td>
                                    <td style="font-size:14px;color:#2B2B2B;">{phone}</td>
                                    </tr></table>
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:10px 0;border-bottom:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0" width="100%"><tr>
                                    <td style="width:140px;font-size:13px;font-weight:700;color:#0C2D70;vertical-align:top;padding-right:16px;">Address:</td>
                                    <td style="font-size:14px;color:#2B2B2B;">{address}{f", {city}" if city else ""}{f", {state}" if state else ""}{f" {zipCode}" if zipCode else ""}</td>
                                    </tr></table>
                                </td>
                                </tr>
                                {"<tr><td style=\"padding:10px 0;border-bottom:1px solid #eeeeee;\"><table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\"><tr><td style=\"width:140px;font-size:13px;font-weight:700;color:#0C2D70;vertical-align:top;padding-right:16px;\">Project:</td><td style=\"font-size:14px;color:#2B2B2B;\">" + projectDescription + "</td></tr></table></td></tr>" if projectDescription else ""}
                                <tr>
                                <td style="padding:10px 0;border-bottom:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0" width="100%"><tr>
                                    <td style="width:140px;font-size:13px;font-weight:700;color:#0C2D70;vertical-align:top;padding-right:16px;">Inspection:</td>
                                    <td style="font-size:14px;color:#2B2B2B;">{'Yes' if inspection == 'yes' else 'No' if inspection == 'no' else 'Not sure'}</td>
                                    </tr></table>
                                </td>
                                </tr>
                            </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color:#f8f8f8;border-top:1px solid #e5e5e5;padding:20px 40px;text-align:center;">
                            <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#0C2D70;">Puget Sound Plumbing and Heating</p>
                            <p style="margin:0;font-size:11px;color:#aaaaaa;">DIY Permit Request Alert</p>
                            </td>
                        </tr>

                        </table>
                    </td>
                    </tr>
                </table>
                </body>
                </html>""",
            }
        )
    except Exception:
        # Company notification failure is non-critical; requester already confirmed
        logger.exception("Company DIY permit request notification email failed")


def _send_job_application_email(
    email: str,
    firstName: str,
    lastName: str,
    position: str,
    resume_bytes: bytes | None = None,
    resume_filename: str | None = None,
):
    """Internal helper – send applicant confirmation + company notification with resume."""
    # 1. Confirmation to applicant
    try:
        resend.Emails.send(
            {
                "from": f"Puget Sound Plumbing and Heating <{EMAIL_FROM}>",
                "to": email,
                "subject": "Application Received — Puget Sound Plumbing and Heating",
                "html": f"""<!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                </head>
                <body style="margin:0;padding:0;background-color:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;padding:48px 0;">
                    <tr>
                    <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:6px;overflow:hidden;">

                        <!-- Logo -->
                        <tr>
                            <td style="padding:40px 40px 32px;text-align:center;">
                            <img
                                src="https://d1fyhmg0o2pfye.cloudfront.net/public/pspah-logo.png"
                                alt="Puget Sound Plumbing and Heating"
                                width="300"
                                style="display:block;margin:0 auto;"
                            />
                            </td>
                        </tr>

                        <!-- Divider -->
                        <tr><td style="padding:0 40px;"><div style="border-top:1px solid #e5e5e5;"></div></td></tr>

                        <!-- Greeting -->
                        <tr>
                            <td style="padding:36px 40px 20px;">
                            <h1 style="margin:0 0 12px;font-size:21px;font-weight:700;color:#0C2D70;">Thanks for Applying, {firstName}!</h1>
                            <p style="margin:0;font-size:15px;line-height:1.75;color:#555555;">
                                We've received your application for the
                                <strong style="color:#2B2B2B;">{position}</strong> position at
                                Puget Sound Plumbing and Heating. Our team will review your
                                qualifications and be in touch if your background is a great fit.
                            </p>
                            </td>
                        </tr>

                        <!-- What to Expect -->
                        <tr>
                            <td style="padding:4px 40px 28px;">
                            <p style="margin:0 0 16px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#999999;">What to Expect</p>
                            <table cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                <td style="padding:10px 0;border-top:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0"><tr>
                                    <td style="width:28px;font-size:13px;font-weight:700;color:#B32020;vertical-align:top;padding-top:1px;">1.</td>
                                    <td style="font-size:14px;color:#555555;line-height:1.6;">Our hiring team reviews all applications carefully.</td>
                                    </tr></table>
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:10px 0;border-top:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0"><tr>
                                    <td style="width:28px;font-size:13px;font-weight:700;color:#B32020;vertical-align:top;padding-top:1px;">2.</td>
                                    <td style="font-size:14px;color:#555555;line-height:1.6;">Qualified candidates are contacted by phone for a brief screening.</td>
                                    </tr></table>
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:10px 0;border-top:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0"><tr>
                                    <td style="width:28px;font-size:13px;font-weight:700;color:#B32020;vertical-align:top;padding-top:1px;">3.</td>
                                    <td style="font-size:14px;color:#555555;line-height:1.6;">Selected applicants are invited to meet our team in person.</td>
                                    </tr></table>
                                </td>
                                </tr>
                            </table>
                            </td>
                        </tr>

                        <!-- Contact blurb -->
                        <tr>
                            <td style="padding:0 40px 32px;">
                            <p style="margin:0;font-size:14px;line-height:1.75;color:#555555;">
                                Questions about the role? Give us a call — we'd love to hear from you.<br/>
                                <span style="font-size:13px;color:#888888;">11803 Des Moines Memorial Dr S, Burien, WA 98168</span>
                            </p>
                            </td>
                        </tr>

                        <!-- CTA -->
                        <tr>
                            <td style="padding:0 40px 44px;text-align:center;">
                            <a
                                href="tel:+12069383219"
                                style="display:inline-block;background-color:#B32020;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 36px;border-radius:3px;letter-spacing:0.05em;"
                            >CALL (206) 938-3219</a>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color:#f8f8f8;border-top:1px solid #e5e5e5;padding:20px 40px;text-align:center;">
                            <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#0C2D70;">Puget Sound Plumbing and Heating</p>
                            <p style="margin:0 0 10px;font-size:11px;color:#aaaaaa;">Licensed &amp; Insured &nbsp;&middot;&nbsp; Serving Greater Seattle Since 1984</p>
                            <p style="margin:0;font-size:11px;color:#bbbbbb;line-height:1.6;">
                                This email was sent because you submitted a job application on our website.<br/>
                                Please do not reply — call us at (206) 938-3219 with any questions.
                            </p>
                            </td>
                        </tr>

                        </table>
                    </td>
                    </tr>
                </table>
                </body>
                </html>""",
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Job application confirmation email failed: {str(e)}",
        )

    # 2. Notification to company with resume attachment
    try:
        company_email_payload = {
            "from": f"Puget Sound Plumbing and Heating <{EMAIL_FROM}>",
            "to": COMPANY_EMAIL,
            "subject": f"New Job Application: {position} — {firstName} {lastName}",
            "html": f"""<!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                </head>
                <body style="margin:0;padding:0;background-color:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;padding:48px 0;">
                    <tr>
                    <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:6px;overflow:hidden;">

                        <!-- Logo -->
                        <tr>
                            <td style="padding:40px 40px 32px;text-align:center;">
                            <img
                                src="https://d1fyhmg0o2pfye.cloudfront.net/public/pspah-logo.png"
                                alt="Puget Sound Plumbing and Heating"
                                width="300"
                                style="display:block;margin:0 auto;"
                            />
                            </td>
                        </tr>

                        <!-- Divider -->
                        <tr><td style="padding:0 40px;"><div style="border-top:1px solid #e5e5e5;"></div></td></tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding:36px 40px 28px;">
                            <h2 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0C2D70;">New Job Application Received</h2>
                            <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
                                <tr>
                                <td style="padding:10px 0;border-top:1px solid #eeeeee;border-bottom:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0" width="100%"><tr>
                                    <td style="width:140px;font-size:13px;font-weight:700;color:#0C2D70;vertical-align:top;padding-right:16px;">Name:</td>
                                    <td style="font-size:14px;color:#2B2B2B;">{firstName} {lastName}</td>
                                    </tr></table>
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:10px 0;border-bottom:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0" width="100%"><tr>
                                    <td style="width:140px;font-size:13px;font-weight:700;color:#0C2D70;vertical-align:top;padding-right:16px;">Position:</td>
                                    <td style="font-size:14px;color:#2B2B2B;">{position}</td>
                                    </tr></table>
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:10px 0;border-bottom:1px solid #eeeeee;">
                                    <table cellpadding="0" cellspacing="0" width="100%"><tr>
                                    <td style="width:140px;font-size:13px;font-weight:700;color:#0C2D70;vertical-align:top;padding-right:16px;">Email:</td>
                                    <td style="font-size:14px;color:#2B2B2B;">{email}</td>
                                    </tr></table>
                                </td>
                                </tr>
                            </table>
                            <p style="margin:0;font-size:14px;color:#555555;line-height:1.6;">
                                {"Resume attached to this email." if resume_bytes else "No resume was uploaded with this application."}
                            </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color:#f8f8f8;border-top:1px solid #e5e5e5;padding:20px 40px;text-align:center;">
                            <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#0C2D70;">Puget Sound Plumbing and Heating</p>
                            <p style="margin:0;font-size:11px;color:#aaaaaa;">Job Application Alert</p>
                            </td>
                        </tr>

                        </table>
                    </td>
                    </tr>
                </table>
                </body>
                </html>""",
        }
        if resume_bytes and resume_filename:
            company_email_payload["attachments"] = [
                {
                    "filename": resume_filename,
                    "content": base64.b64encode(resume_bytes).decode("utf-8"),
                }
            ]
        resend.Emails.send(company_email_payload)
    except Exception:
        # Company notification failure is non-critical; applicant already confirmed
        logger.exception("Company job application notification email failed")
