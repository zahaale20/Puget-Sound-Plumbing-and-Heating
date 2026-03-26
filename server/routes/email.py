import os
import logging
from fastapi import APIRouter, HTTPException
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
