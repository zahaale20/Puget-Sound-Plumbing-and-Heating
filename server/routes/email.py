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
            logger.exception("Schedule saved but follow-up email failed: %s", email_error.detail)
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
                "subject": "We'll Be In Touch Soon",
                "html": f"""
                <html>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #0C2D70;">Thank You, {firstName}!</h2>
                            
                            <p>We've received your schedule request and appreciate you reaching out to Puget Sound Plumbing and Heating.</p>
                            
                            <p>Our team will review your information and contact you shortly to confirm your appointment. We look forward to helping you with your plumbing and heating needs.</p>
                            
                            <div style="margin: 30px 0; padding: 20px; background-color: #f5f5f5; border-left: 4px solid #B32020;">
                                <h3 style="color: #0C2D70; margin-top: 0;">Quick Contact Info</h3>
                                <p><strong>Phone:</strong> <a href="tel:206-938-3219">(206) 938-3219</a></p>
                                <p><strong>Address:</strong> 11803 Des Moines Memorial Dr S, Burien, WA 98168</p>
                                <p><strong>Hours:</strong> 24 Hours a Day, 7 Days a Week</p>
                            </div>
                            
                            <p>If you have any questions in the meantime, feel free to give us a call.</p>
                            
                            <p>Best regards,<br><strong>Puget Sound Plumbing and Heating Team</strong></p>
                            
                            <hr style="border: none; border-top: 1px solid #ddd; margin-top: 30px;">
                            <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply to this message.</p>
                        </div>
                    </body>
                </html>
                """,
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Email send failed for sender '{EMAIL_FROM}': {str(e)}",
        )
