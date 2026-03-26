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
                "from": EMAIL_FROM,
                "to": email,
                "subject": "We Received Your Request — Puget Sound Plumbing and Heating",
                "html": f"""<!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                </head>
                <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
                    <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

                        <!-- Header / Logo -->
                        <tr>
                            <td style="background-color:#0C2D70;padding:28px 40px;text-align:center;">
                            <img
                                src="https://d1fyhmg0o2pfye.cloudfront.net/public/pspah-logo.png"
                                alt="Puget Sound Plumbing and Heating"
                                width="200"
                                style="display:block;margin:0 auto;"
                            />
                            </td>
                        </tr>

                        <!-- Red accent bar -->
                        <tr><td style="background-color:#B32020;height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>

                        <!-- Greeting -->
                        <tr>
                            <td style="padding:40px 40px 24px;">
                            <h1 style="margin:0 0 12px;font-size:22px;color:#0C2D70;">Thank You, {firstName}!</h1>
                            <p style="margin:0;font-size:15px;line-height:1.7;color:#444444;">
                                We've received your service request and appreciate you reaching out to
                                <strong>Puget Sound Plumbing and Heating</strong>. A member of our team will
                                reach out to you by phone to get your appointment scheduled at a time that works best for you.
                            </p>
                            </td>
                        </tr>

                        <!-- What happens next -->
                        <tr>
                            <td style="padding:0 40px 32px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f8f8;border-left:4px solid #B32020;">
                                <tr>
                                <td style="padding:24px;">
                                    <p style="margin:0 0 14px;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:0.06em;color:#0C2D70;">What Happens Next</p>
                                    <table cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding:6px 14px 6px 0;vertical-align:top;font-size:18px;color:#B32020;font-weight:bold;line-height:1.4;">1.</td>
                                        <td style="padding:6px 0;font-size:14px;color:#444444;line-height:1.6;">Our team reviews your request and prepares for your call.</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:6px 14px 6px 0;vertical-align:top;font-size:18px;color:#B32020;font-weight:bold;line-height:1.4;">2.</td>
                                        <td style="padding:6px 0;font-size:14px;color:#444444;line-height:1.6;">A representative calls you to discuss your needs and schedule a convenient visit.</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:6px 14px 6px 0;vertical-align:top;font-size:18px;color:#B32020;font-weight:bold;line-height:1.4;">3.</td>
                                        <td style="padding:6px 0;font-size:14px;color:#444444;line-height:1.6;">A licensed technician arrives at your home, fully equipped and ready to help.</td>
                                    </tr>
                                    </table>
                                </td>
                                </tr>
                            </table>
                            </td>
                        </tr>

                        <!-- Contact Info -->
                        <tr>
                            <td style="padding:0 40px 40px;">
                            <p style="margin:0 0 16px;font-size:14px;color:#444444;line-height:1.7;">
                                Need immediate assistance? Don't wait — give us a call any time, day or night.
                                We're available <strong>24 hours a day, 7 days a week</strong>.
                            </p>
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                <td style="padding:7px 0;font-size:14px;color:#444444;">
                                    <strong style="color:#0C2D70;">Phone:</strong>&nbsp;
                                    <a href="tel:206-938-3219" style="color:#B32020;text-decoration:none;font-weight:bold;">(206) 938-3219</a>
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:7px 0;font-size:14px;color:#444444;">
                                    <strong style="color:#0C2D70;">Address:</strong>&nbsp;11803 Des Moines Memorial Dr S, Burien, WA 98168
                                </td>
                                </tr>
                                <tr>
                                <td style="padding:7px 0;font-size:14px;color:#444444;">
                                    <strong style="color:#0C2D70;">Hours:</strong>&nbsp;24 / 7 &mdash; Emergency &amp; Scheduled Service
                                </td>
                                </tr>
                            </table>
                            </td>
                        </tr>

                        <!-- CTA -->
                        <tr>
                            <td style="padding:0 40px 40px;text-align:center;">
                            <a
                                href="https://pugetsoundplumbing.com/schedule-online"
                                style="display:inline-block;background-color:#B32020;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:2px;letter-spacing:0.04em;"
                            >VIEW YOUR REQUEST</a>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color:#0C2D70;padding:24px 40px;text-align:center;">
                            <p style="margin:0 0 6px;font-size:13px;color:#ffffff;font-weight:bold;">Puget Sound Plumbing and Heating</p>
                            <p style="margin:0;font-size:12px;color:#aac0e8;">Licensed &amp; Insured &nbsp;|&nbsp; Serving Greater Seattle Since 1984</p>
                            </td>
                        </tr>

                        <!-- Legal -->
                        <tr>
                            <td style="padding:16px 40px;text-align:center;">
                            <p style="margin:0;font-size:11px;color:#999999;line-height:1.6;">
                                This is an automated confirmation email sent because you submitted a service request on our website.<br/>
                                Please do not reply directly to this message — call us at (206) 938-3219 for immediate help.
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
