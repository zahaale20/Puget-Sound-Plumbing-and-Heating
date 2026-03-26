import os
import base64
import logging
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from pydantic import BaseModel
import resend
from database import get_db_connection

router = APIRouter(prefix="/api", tags=["email"])
resend.api_key = os.getenv("RESEND_API_KEY")
logger = logging.getLogger(__name__)
EMAIL_FROM = os.getenv("RESEND_FROM_EMAIL", "noreply@cavostudio.com")


class EmailRequest(BaseModel):
    email: str
    firstName: str


class ScheduleRequest(BaseModel):
    firstName: str
    lastName: str
    phone: str
    email: str
    message: str = ""


class NewsletterRequest(BaseModel):
    email: str


class RedeemOfferRequest(BaseModel):
    firstName: str
    lastName: str
    phone: str
    email: str
    couponDiscount: str
    couponCondition: str


class DiyPermitRequest(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: str
    address: str
    city: str = ""
    projectDescription: str = ""
    inspection: str = "unsure"


@router.post("/send-email")
async def send_email(request: EmailRequest):
    """Send a professional follow-up email to schedule online requests"""
    try:
        _send_followup_email(request.email, request.firstName)
        return {"success": True, "message": "Email sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/schedule")
async def schedule_online(request: ScheduleRequest):
    """Insert schedule request into DB and send follow-up email"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO "Schedule Online"
                        (first_name, last_name, email, phone, message, "hasBeenContacted")
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (
                        request.firstName,
                        request.lastName,
                        request.email,
                        request.phone,
                        request.message,
                        False,
                    ),
                )
            conn.commit()

        try:
            _send_followup_email(request.email, request.firstName)
            return {"success": True, "emailStatus": "sent"}
        except HTTPException as email_error:
            logger.exception("Message saved to Supabase but follow-up email failed: %s", email_error.detail)
            return {
                "success": True,
                "emailStatus": "failed",
                "message": "Schedule request saved, but follow-up email could not be sent.",
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/newsletter")
async def subscribe_newsletter(request: NewsletterRequest):
    """Save newsletter subscription email to DB"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    'INSERT INTO "Newsletter" (email) VALUES (%s)',
                    (request.email,),
                )
            conn.commit()
        return {"success": True}
    except Exception as e:
        if "unique" in str(e).lower() or "duplicate" in str(e).lower():
            return {"success": True, "message": "Already subscribed"}
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/redeem-offer")
async def redeem_offer(request: RedeemOfferRequest):
    """Insert coupon redemption into DB and send coupon email"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO "Redeemed Offers"
                        (first_name, last_name, email, phone, coupon_discount, coupon_condition)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (
                        request.firstName,
                        request.lastName,
                        request.email,
                        request.phone,
                        request.couponDiscount,
                        request.couponCondition,
                    ),
                )
            conn.commit()

        try:
            _send_coupon_email(request.email, request.firstName, request.couponDiscount, request.couponCondition)
            return {"success": True, "emailStatus": "sent"}
        except HTTPException as email_error:
            logger.exception("Offer saved but coupon email failed: %s", email_error.detail)
            return {
                "success": True,
                "emailStatus": "failed",
                "message": "Offer saved, but coupon email could not be sent.",
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/diy-permit")
async def submit_diy_permit(request: DiyPermitRequest):
    """Insert DIY permit request into DB and send confirmation email"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO "DIY Permit Requests"
                        (first_name, last_name, email, phone, address, city, project_description, inspection)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        request.firstName,
                        request.lastName,
                        request.email,
                        request.phone,
                        request.address,
                        request.city,
                        request.projectDescription,
                        request.inspection,
                    ),
                )
            conn.commit()

        try:
            _send_diy_permit_email(request.email, request.firstName, request.address)
            return {"success": True, "emailStatus": "sent"}
        except HTTPException as email_error:
            logger.exception("DIY permit saved but email failed: %s", email_error.detail)
            return {
                "success": True,
                "emailStatus": "failed",
                "message": "Request saved, but confirmation email could not be sent.",
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
    resume: Optional[UploadFile] = File(None),
):
    """Insert job application into DB, email resume to company, send confirmation to applicant"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO "Job Applications"
                        (first_name, last_name, email, phone, position, experience, message, additional_info)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (firstName, lastName, email, phone, position, experience, message, additionalInfo),
                )
            conn.commit()

        resume_bytes = None
        resume_filename = None
        if resume:
            resume_bytes = await resume.read()
            resume_filename = resume.filename

        try:
            _send_job_application_email(email, firstName, position, resume_bytes, resume_filename)
            return {"success": True, "emailStatus": "sent"}
        except HTTPException as email_error:
            logger.exception("Application saved but email notification failed: %s", email_error.detail)
            return {
                "success": True,
                "emailStatus": "failed",
                "message": "Application saved, but email notification could not be sent.",
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
                                href="tel:206-938-3219"
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


def _send_coupon_email(email: str, firstName: str, couponDiscount: str, couponCondition: str):
    """Internal helper – send the coupon confirmation email."""
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
                            <table width="100%" cellpadding="0" cellspacing="0" style="border:4px dashed #B32020;background-color:#ffffff;">
                                <tr>
                                <td style="padding:28px 16px;text-align:center;">
                                    <p style="margin:0 0 14px;font-size:40px;line-height:1;">🏷</p>
                                    <table cellpadding="0" cellspacing="0" style="margin:0 auto 14px;">
                                    <tr>
                                        <td style="font-size:24px;font-weight:700;color:#0C2D70;text-transform:uppercase;border-bottom:4px solid #B32020;padding-bottom:6px;text-align:center;white-space:nowrap;">
                                        {couponDiscount}
                                        </td>
                                    </tr>
                                    </table>
                                    <p style="font-size:14px;font-weight:600;color:#2B2B2B;text-transform:uppercase;margin:0 0 8px;">{couponCondition}</p>
                                    <p style="font-size:12px;color:#555555;margin:0;">Cannot be combined with other offers.</p>
                                </td>
                                <td style="width:36px;border-left:2px dashed #B32020;text-align:center;vertical-align:middle;">
                                    <span style="font-size:20px;color:#B32020;">&#9986;</span>
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
                                href="tel:206-938-3219"
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


def _send_diy_permit_email(email: str, firstName: str, address: str):
    """Internal helper – send DIY permit request confirmation email."""
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
                                href="tel:206-938-3219"
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


def _send_job_application_email(
    email: str,
    firstName: str,
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
                                href="tel:206-938-3219"
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
            "to": EMAIL_FROM,
            "subject": f"New Job Application: {position} — {firstName}",
            "html": f"""<p>A new job application has been submitted.</p>
                <ul>
                    <li><strong>Name:</strong> {firstName}</li>
                    <li><strong>Position:</strong> {position}</li>
                    <li><strong>Email:</strong> {email}</li>
                </ul>
                <p>{"Resume attached." if resume_bytes else "No resume uploaded."}</p>""",
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
