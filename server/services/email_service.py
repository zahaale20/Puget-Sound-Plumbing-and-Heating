import os
import base64
import logging
import re
import html as html_module
from typing import Optional

import resend

logger = logging.getLogger(__name__)

resend.api_key = os.getenv("RESEND_API_KEY")
EMAIL_FROM = os.getenv("RESEND_FROM_EMAIL", "noreply@cavostudio.com")
COMPANY_EMAIL = os.getenv("COMPANY_EMAIL", "alexthebestest@gmail.com").replace("\r", "").replace("\n", "").strip()
LOGO_URL = os.getenv(
    "LOGO_URL",
    "https://hyxqrhttputdkefadnrf.supabase.co/storage/v1/object/public/assets/logo/pspah-logo.webp",
)
COMPANY_NAME = "Puget Sound Plumbing and Heating"
COMPANY_PHONE = "(206) 938-3219"
COMPANY_PHONE_HREF = "tel:+12069383219"
COMPANY_ADDRESS = "11803 Des Moines Memorial Dr S, Burien, WA 98168"


# ─── Sanitization Helpers ─────────────────────────────────────────────────────


def _safe_addr(value: str) -> str:
    return value.strip().lower().replace("\r", "").replace("\n", "")


def _safe_hdr(value: str) -> str:
    return re.sub(r"[\r\n]+", " ", (value or "")).strip()


def _esc(value: str) -> str:
    return html_module.escape((value or "").strip(), quote=True)


# ─── Template Building Blocks ─────────────────────────────────────────────────


def _logo() -> str:
    return (
        '<tr><td style="padding:40px 40px 32px;text-align:center;">'
        f'<img src="{LOGO_URL}" alt="{COMPANY_NAME}" width="300" '
        'style="display:block;margin:0 auto;"/>'
        "</td></tr>"
        '<tr><td style="padding:0 40px;">'
        '<div style="border-top:1px solid #e5e5e5;"></div>'
        "</td></tr>"
    )


def _heading(title: str, description: str = "") -> str:
    desc = (
        f'<p style="margin:0;font-size:15px;line-height:1.75;color:#555555;">'
        f"{description}</p>"
        if description
        else ""
    )
    return (
        '<tr><td style="padding:36px 40px 20px;">'
        f'<h1 style="margin:0 0 12px;font-size:21px;font-weight:700;color:#0C2D70;">'
        f"{title}</h1>"
        f"{desc}"
        "</td></tr>"
    )


def _steps(label: str, items: list[str]) -> str:
    rows = ""
    for i, item in enumerate(items, 1):
        rows += (
            '<tr><td style="padding:10px 0;border-top:1px solid #eeeeee;">'
            '<table cellpadding="0" cellspacing="0"><tr>'
            f'<td style="width:28px;font-size:13px;font-weight:700;color:#B32020;'
            f'vertical-align:top;padding-top:1px;">{i}.</td>'
            f'<td style="font-size:14px;color:#555555;line-height:1.6;">{item}</td>'
            "</tr></table></td></tr>"
        )
    return (
        '<tr><td style="padding:4px 40px 28px;">'
        f'<p style="margin:0 0 16px;font-size:12px;font-weight:700;'
        f'text-transform:uppercase;letter-spacing:0.08em;color:#999999;">{label}</p>'
        f'<table cellpadding="0" cellspacing="0" width="100%">{rows}</table>'
        "</td></tr>"
    )


def _contact(text: str = None) -> str:
    text = text or (
        "Need immediate help? We're available "
        '<strong style="color:#2B2B2B;">24 hours a day, 7 days a week</strong>.<br/>'
        f'<span style="font-size:13px;color:#888888;">{COMPANY_ADDRESS}</span>'
    )
    return (
        '<tr><td style="padding:0 40px 32px;">'
        f'<p style="margin:0;font-size:14px;line-height:1.75;color:#555555;">{text}</p>'
        "</td></tr>"
    )


def _cta(text: str = None, href: str = None) -> str:
    text = text or f"CALL {COMPANY_PHONE}"
    href = href or COMPANY_PHONE_HREF
    return (
        '<tr><td style="padding:0 40px 44px;text-align:center;">'
        f'<a href="{href}" style="display:inline-block;background-color:#B32020;'
        f"color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;"
        f'padding:13px 36px;border-radius:3px;letter-spacing:0.05em;">{text}</a>'
        "</td></tr>"
    )


def _data_table(rows: list[tuple[str, str]]) -> str:
    html = ""
    for i, (label, value) in enumerate(rows):
        border = (
            "border-top:1px solid #eeeeee;border-bottom:1px solid #eeeeee;"
            if i == 0
            else "border-bottom:1px solid #eeeeee;"
        )
        html += (
            f'<tr><td style="padding:10px 0;{border}">'
            '<table cellpadding="0" cellspacing="0" width="100%"><tr>'
            f'<td style="width:140px;font-size:13px;font-weight:700;color:#0C2D70;'
            f'vertical-align:top;padding-right:16px;">{label}:</td>'
            f'<td style="font-size:14px;color:#2B2B2B;">{value}</td>'
            "</tr></table></td></tr>"
        )
    return f'<table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">{html}</table>'


_TAG_SVG = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="22" height="22" '
    'fill="#ffffff" style="display:block;">'
    '<path d="M0 252.118V48C0 21.49 21.49 0 48 0h204.118a48 48 0 0 1 33.941 14.059l211.882 '
    "211.882c18.745 18.745 18.745 49.137 0 67.882L293.823 497.941c-18.745 18.745-49.137 "
    "18.745-67.882 0L14.059 286.059A48 48 0 0 1 0 252.118zM112 64c-26.51 0-48 21.49-48 "
    '48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48z"/></svg>'
)

_SCISSORS_SVG = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="24" height="24" '
    'fill="#B32020" style="display:block;transform:rotate(270deg);">'
    '<path d="M278.06 256L444.48 89.57c4.69-4.69 4.69-12.29 0-16.97-32.8-32.8-85.99-32.8'
    "-118.79 0L210.18 188.12l-24.86-24.86c4.31-10.92 6.68-22.81 6.68-35.26 0-53.02-42.98"
    "-96-96-96S0 74.98 0 128s42.98 96 96 96c12.45 0 24.34-2.37 35.27-6.68l24.85 24.85"
    "-24.85 24.86C120.34 262.37 108.45 260 96 260c-53.02 0-96 42.98-96 96s42.98 96 96 "
    "96c53.02 0 96-42.98 96-96 0-12.45-2.37-24.34-6.68-35.27l24.86-24.85L325.69 411.4"
    "c32.8 32.8 85.99 32.8 118.79 0 4.69-4.68 4.69-12.28 0-16.97L278.06 256zM96 160"
    "c-17.64 0-32-14.36-32-32s14.36-32 32-32 32 14.36 32 32-14.36 32-32 32zm0 256"
    'c-17.64 0-32-14.36-32-32s14.36-32 32-32 32 14.36 32 32-14.36 32-32 32z"/></svg>'
)


def _coupon_card(coupon_id: str, discount: str, condition: str) -> str:
    return (
        '<tr><td style="padding:4px 40px 36px;">'
        '<table cellpadding="0" cellspacing="0" style="width:420px;margin:0 auto;'
        "border:4px dashed #B32020;background-color:#ffffff;"
        'box-shadow:0 4px 12px rgba(0,0,0,0.12);position:relative;">'
        '<tr><td style="width:420px;padding:24px 32px;text-align:center;vertical-align:middle;">'
        # Coupon ID badge
        '<table cellpadding="0" cellspacing="0" style="margin:0 auto 14px;border-radius:4px;overflow:hidden;">'
        "<tr>"
        f'<td style="background-color:#B32020;padding:8px 10px 8px 14px;vertical-align:middle;">{_TAG_SVG}</td>'
        f'<td style="background-color:#B32020;padding:8px 14px 8px 6px;vertical-align:middle;'
        f'font-size:13px;font-weight:700;color:#ffffff;letter-spacing:0.05em;white-space:nowrap;">'
        f"{coupon_id}</td>"
        "</tr></table>"
        # Discount amount
        '<table cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">'
        '<tr><td style="font-size:26px;font-weight:700;color:#0C2D70;text-transform:uppercase;'
        "border-bottom:4px solid #B32020;padding-bottom:6px;text-align:center;"
        f'white-space:nowrap;letter-spacing:0.04em;">{discount}</td></tr></table>'
        # Condition & fine print
        f'<p style="font-size:14px;font-weight:600;color:#2B2B2B;text-transform:uppercase;'
        f'margin:0 0 8px;letter-spacing:0.03em;">{condition}</p>'
        '<p style="font-size:11px;color:#555555;margin:0;">Cannot be combined with other offers.</p>'
        "</td>"
        # Scissors
        f'<td style="width:32px;vertical-align:bottom;padding-bottom:40px;padding-right:0;">'
        f"{_SCISSORS_SVG}</td>"
        "</tr></table></td></tr>"
    )


def _customer_footer(note: str, unsubscribe_url: str = "") -> str:
    unsub = (
        f'<a href="{unsubscribe_url}" style="font-size:10px;color:#cccccc;'
        f'text-decoration:underline;">Unsubscribe</a>'
        if unsubscribe_url
        else ""
    )
    return (
        '<tr><td style="background-color:#f8f8f8;border-top:1px solid #e5e5e5;'
        'padding:20px 40px;text-align:center;">'
        f'<p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#0C2D70;">'
        f"{COMPANY_NAME}</p>"
        '<p style="margin:0 0 10px;font-size:11px;color:#aaaaaa;">'
        "Licensed &amp; Insured &nbsp;&middot;&nbsp; Serving Greater Seattle Since 1984</p>"
        f'<p style="margin:0 0 8px;font-size:11px;color:#bbbbbb;line-height:1.6;">{note}</p>'
        f"{unsub}"
        "</td></tr>"
    )


def _notif_footer(label: str) -> str:
    return (
        '<tr><td style="background-color:#f8f8f8;border-top:1px solid #e5e5e5;'
        'padding:20px 40px;text-align:center;">'
        f'<p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#0C2D70;">'
        f"{COMPANY_NAME}</p>"
        f'<p style="margin:0;font-size:11px;color:#aaaaaa;">{label}</p>'
        "</td></tr>"
    )


def _wrap(content: str, footer: str) -> str:
    return (
        '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>'
        '<meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>'
        '<body style="margin:0;padding:0;background-color:#f0f0f0;'
        'font-family:Arial,Helvetica,sans-serif;">'
        '<table width="100%" cellpadding="0" cellspacing="0" '
        'style="background-color:#f0f0f0;padding:48px 0;">'
        "<tr><td align=\"center\">"
        '<table width="560" cellpadding="0" cellspacing="0" '
        'style="max-width:560px;width:100%;background-color:#ffffff;'
        'border-radius:6px;overflow:hidden;">'
        f"{_logo()}{content}{footer}"
        "</table></td></tr></table></body></html>"
    )


def _send(*, to: str, subject: str, html: str, attachments: list = None):
    """Send an email via Resend API."""
    payload = {
        "from": f"{COMPANY_NAME} <{EMAIL_FROM}>",
        "to": to,
        "subject": subject,
        "html": html,
    }
    if attachments:
        payload["attachments"] = attachments
    resend.Emails.send(payload)


def _send_notification(
    *, subject: str, title: str, rows: list[tuple[str, str]], label: str, extra: str = ""
):
    """Helper for company notification emails (title + data table)."""
    content = (
        '<tr><td style="padding:36px 40px 28px;">'
        f'<h2 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0C2D70;">'
        f"{title}</h2>"
        f"{_data_table(rows)}"
        "</td></tr>"
        f"{extra}"
    )
    _send(to=COMPANY_EMAIL, subject=subject, html=_wrap(content, _notif_footer(label)))


# ─── Customer Emails ──────────────────────────────────────────────────────────


def send_followup(email: str, first_name: str):
    """Send follow-up confirmation email for schedule requests."""
    email = _safe_addr(email)
    fn = _esc(first_name)

    content = _heading(
        f"Thank You, {fn}!",
        f"We've received your service request and appreciate you reaching out to "
        f'<strong style="color:#2B2B2B;">{COMPANY_NAME}</strong>. '
        f"A member of our team will reach out to you by phone to get your "
        f"appointment scheduled at a time that works best for you.",
    )
    content += _steps(
        "What Happens Next",
        [
            "Our team reviews your request and prepares for your call.",
            "A representative calls you to discuss your needs and schedule a convenient visit.",
            "A licensed technician arrives at your home, fully equipped and ready to help.",
        ],
    )
    content += _contact()
    content += _cta()
    footer = _customer_footer(
        "This automated email was sent because you submitted a service request on our website.<br/>"
        f"Please do not reply &mdash; call us at {COMPANY_PHONE} for immediate help."
    )
    _send(to=email, subject=f"We Received Your Request — {COMPANY_NAME}", html=_wrap(content, footer))


def send_newsletter_confirmation(email: str, unsubscribe_url: str):
    """Send newsletter welcome confirmation with unsubscribe link."""
    email = _safe_addr(email)
    unsub_esc = _esc(unsubscribe_url)

    content = _heading(
        "Thank You for Subscribing!",
        f"You're officially on the {COMPANY_NAME} mailing list. "
        "We'll send seasonal maintenance tips, occasional promotions, and company updates.",
    )
    content += _steps(
        "What Happens Next",
        [
            "You'll receive useful plumbing and heating tips for the Puget Sound area.",
            "You'll get access to occasional limited-time promotions and offers.",
            "You can unsubscribe anytime using the button below.",
        ],
    )
    content += _contact(
        "Need immediate plumbing help? We're available "
        '<strong style="color:#2B2B2B;">24 hours a day, 7 days a week</strong>.<br/>'
        f'<span style="font-size:13px;color:#888888;">{COMPANY_ADDRESS}</span>'
    )
    content += _cta()
    footer = _customer_footer(
        "This automated email was sent because you joined our mailing list on our website.<br/>"
        f"Please do not reply &mdash; call us at {COMPANY_PHONE} for immediate help.",
        unsubscribe_url=unsub_esc,
    )
    _send(to=email, subject=f"You're Subscribed — {COMPANY_NAME}", html=_wrap(content, footer))


def send_newsletter_unsubscribe_confirmation(email: str):
    """Send confirmation after newsletter unsubscribe."""
    email = _safe_addr(email)

    content = _heading(
        "You're Unsubscribed",
        "Your email address has been removed from our mailing list "
        "and you will no longer receive newsletter messages.",
    )
    content += _contact(
        "Need immediate plumbing help? We're available "
        '<strong style="color:#2B2B2B;">24 hours a day, 7 days a week</strong>.<br/>'
        f'<span style="font-size:13px;color:#888888;">{COMPANY_ADDRESS}</span>'
    )
    content += _cta()
    footer = _customer_footer(
        "This automated email confirms your newsletter unsubscribe request."
    )
    _send(
        to=email,
        subject=f"You've Been Unsubscribed — {COMPANY_NAME}",
        html=_wrap(content, footer),
    )


def send_coupon_confirmation(
    email: str, first_name: str, coupon_id: str, discount: str, condition: str
):
    """Send coupon confirmation email to customer."""
    email = _safe_addr(email)
    fn = _esc(first_name)
    cid = _esc(coupon_id)
    disc = _esc(discount)
    cond = _esc(condition)
    subject_disc = _safe_hdr(discount)

    content = _heading(
        f"Here's Your Coupon, {fn}!",
        "Save this email and mention your coupon when you call to schedule your service. "
        "Must be presented at the time of booking &mdash; one coupon per customer.",
    )
    content += _coupon_card(cid, disc, cond)
    content += (
        '<tr><td style="padding:0 40px 44px;text-align:center;">'
        '<p style="margin:0 0 20px;font-size:14px;line-height:1.75;color:#555555;">'
        "Ready to schedule? Give us a call &mdash; we're available "
        '<strong style="color:#2B2B2B;">24 hours a day, 7 days a week</strong>.</p>'
        f'<a href="{COMPANY_PHONE_HREF}" style="display:inline-block;background-color:#B32020;'
        f"color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;"
        f'padding:13px 36px;border-radius:3px;letter-spacing:0.05em;">'
        f"CALL {COMPANY_PHONE}</a>"
        "</td></tr>"
    )
    footer = _customer_footer(
        "This coupon was sent because you submitted a redemption request on our website.<br/>"
        f"{COMPANY_ADDRESS}"
    )
    _send(
        to=email,
        subject=f"Your Coupon: {subject_disc} — {COMPANY_NAME}",
        html=_wrap(content, footer),
    )


def send_diy_permit_confirmation(email: str, first_name: str, address: str):
    """Send DIY permit request confirmation to customer."""
    email = _safe_addr(email)
    fn = _esc(first_name)
    addr = _esc(address)

    content = _heading(
        f"Request Received, {fn}!",
        f"We've received your DIY plumbing permit request for "
        f'<strong style="color:#2B2B2B;">{addr}</strong>. '
        "A member of our team will review your project details and reach out "
        "to help guide you through the permit process.",
    )
    content += _steps(
        "What Happens Next",
        [
            "Our team reviews your project details and permit requirements.",
            "We contact you with guidance on the permit process and next steps.",
            "Your project proceeds safely and up to local code requirements.",
        ],
    )
    content += _contact(
        "Have questions in the meantime? We're available "
        '<strong style="color:#2B2B2B;">24 hours a day, 7 days a week</strong>.<br/>'
        f'<span style="font-size:13px;color:#888888;">{COMPANY_ADDRESS}</span>'
    )
    content += _cta()
    footer = _customer_footer(
        "This email was sent because you submitted a DIY permit request on our website.<br/>"
        f"Please do not reply &mdash; call us at {COMPANY_PHONE} for immediate help."
    )
    _send(
        to=email,
        subject=f"DIY Permit Request Received — {COMPANY_NAME}",
        html=_wrap(content, footer),
    )


def send_job_application_confirmation(email: str, first_name: str, position: str):
    """Send job application confirmation to applicant."""
    email = _safe_addr(email)
    fn = _esc(first_name)
    pos = _esc(position)

    content = _heading(
        f"Thanks for Applying, {fn}!",
        f"We've received your application for the "
        f'<strong style="color:#2B2B2B;">{pos}</strong> position at '
        f"{COMPANY_NAME}. Our team will review your qualifications and be in touch "
        "if your background is a great fit.",
    )
    content += _steps(
        "What to Expect",
        [
            "Our hiring team reviews all applications carefully.",
            "Qualified candidates are contacted by phone for a brief screening.",
            "Selected applicants are invited to meet our team in person.",
        ],
    )
    content += _contact(
        "Questions about the role? Give us a call &mdash; we'd love to hear from you.<br/>"
        f'<span style="font-size:13px;color:#888888;">{COMPANY_ADDRESS}</span>'
    )
    content += _cta()
    footer = _customer_footer(
        "This email was sent because you submitted a job application on our website.<br/>"
        f"Please do not reply &mdash; call us at {COMPANY_PHONE} with any questions."
    )
    _send(
        to=email,
        subject=f"Application Received — {COMPANY_NAME}",
        html=_wrap(content, footer),
    )


# ─── Company Notification Emails ─────────────────────────────────────────────


def send_schedule_notification(
    email: str, first_name: str, last_name: str, phone: str, message: str
):
    """Notify company of new schedule request."""
    rows = [
        ("Name", f"{_esc(first_name)} {_esc(last_name)}"),
        ("Email", _safe_addr(email)),
        ("Phone", _esc(phone)),
    ]
    if message:
        rows.append(("Message", _esc(message)))
    try:
        _send_notification(
            subject=f"New Service Request — {_safe_hdr(f'{first_name} {last_name}')}",
            title="New Service Request",
            rows=rows,
            label="Schedule Online Request Alert",
        )
    except Exception:
        logger.exception("Company schedule request notification email failed")


def send_newsletter_notification(email: str):
    """Notify company of new newsletter subscriber."""
    try:
        _send_notification(
            subject=f"New Newsletter Subscriber — {_safe_hdr(email)}",
            title="New Newsletter Subscriber",
            rows=[("Email", _safe_addr(email))],
            label="Newsletter Subscription Alert",
        )
    except Exception:
        logger.exception("Company newsletter subscription notification email failed")


def send_newsletter_unsubscribe_notification(email: str):
    """Notify company of newsletter unsubscribe."""
    email_safe = _safe_addr(email)
    content = (
        '<tr><td style="padding:36px 40px 28px;">'
        '<h2 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0C2D70;">'
        "Newsletter Unsubscribe</h2>"
        '<p style="margin:0 0 20px;font-size:14px;line-height:1.75;color:#555555;">'
        "The following email has unsubscribed from the newsletter mailing list:</p>"
        f"{_data_table([('Email', email_safe)])}"
        "</td></tr>"
    )
    try:
        _send(
            to=COMPANY_EMAIL,
            subject=f"Newsletter Unsubscribe — {_safe_hdr(email)}",
            html=_wrap(content, _notif_footer("Newsletter Unsubscribe Alert")),
        )
    except Exception:
        logger.exception("Company newsletter unsubscribe notification email failed")


def send_coupon_notification(
    email: str,
    first_name: str,
    last_name: str,
    phone: str,
    coupon_id: str,
    discount: str,
    condition: str,
):
    """Notify company of coupon redemption."""
    fn = _esc(first_name)
    ln = _esc(last_name)
    cid = _esc(coupon_id)
    disc = _esc(discount)
    cond = _esc(condition)

    card = (
        '<tr><td style="padding:0 40px 32px;">'
        '<table cellpadding="0" cellspacing="0" style="width:420px;max-width:100%;'
        'margin:0 auto;border:4px dashed #B32020;background-color:#ffffff;">'
        '<tr><td style="padding:22px 20px;text-align:center;">'
        '<table cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">'
        f'<tr><td style="background-color:#B32020;padding:8px 14px;font-size:12px;'
        f'font-weight:700;color:#ffffff;letter-spacing:0.06em;white-space:nowrap;">'
        f"COUPON ID: {cid}</td></tr></table>"
        f'<p style="margin:0 0 10px;font-size:25px;font-weight:700;color:#0C2D70;'
        f'text-transform:uppercase;letter-spacing:0.04em;">{disc}</p>'
        f'<p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#2B2B2B;'
        f'text-transform:uppercase;letter-spacing:0.03em;">{cond}</p>'
        '<p style="margin:0;font-size:11px;color:#555555;">Cannot be combined with other offers.</p>'
        "</td></tr></table></td></tr>"
    )

    rows = [
        ("Name", f"{fn} {ln}"),
        ("Email", _safe_addr(email)),
        ("Phone", _esc(phone)),
    ]
    try:
        _send_notification(
            subject=(
                f"New Coupon Redemption: {_safe_hdr(coupon_id)} ({_safe_hdr(discount)})"
                f" — {_safe_hdr(f'{first_name} {last_name}')}"
            ),
            title="New Coupon Redemption",
            rows=rows,
            label="Coupon Redemption Alert",
            extra=card,
        )
    except Exception:
        logger.exception("Company coupon redemption notification email failed")


def send_diy_permit_notification(
    email: str,
    first_name: str,
    last_name: str,
    phone: str,
    address: str,
    city: str = "",
    state: str = "",
    zip_code: str = "",
    project_description: str = "",
    inspection: str = "unsure",
):
    """Notify company of DIY permit request."""
    fn = _esc(first_name)
    ln = _esc(last_name)
    addr_full = _esc(address)
    if city:
        addr_full += f", {_esc(city)}"
    if state:
        addr_full += f", {_esc(state)}"
    if zip_code:
        addr_full += f" {_esc(zip_code)}"

    rows = [
        ("Name", f"{fn} {ln}"),
        ("Email", _safe_addr(email)),
        ("Phone", _esc(phone)),
        ("Address", addr_full),
    ]
    if project_description:
        rows.append(("Project", _esc(project_description)))
    insp_label = {"yes": "Yes", "no": "No"}.get(inspection, "Not sure")
    rows.append(("Inspection", insp_label))

    try:
        _send_notification(
            subject=f"New DIY Permit Request — {_safe_hdr(f'{first_name} {last_name}')}",
            title="New DIY Permit Request",
            rows=rows,
            label="DIY Permit Request Alert",
        )
    except Exception:
        logger.exception("Company DIY permit request notification email failed")


def send_job_application_notification(
    email: str,
    first_name: str,
    last_name: str,
    position: str,
    resume_bytes: bytes | None = None,
    resume_filename: str | None = None,
):
    """Notify company of job application with optional resume attachment."""
    fn = _esc(first_name)
    ln = _esc(last_name)
    pos = _esc(position)

    has_resume = bool(resume_bytes)
    resume_note = (
        "Resume attached to this email."
        if has_resume
        else "No resume was uploaded with this application."
    )

    rows = [
        ("Name", f"{fn} {ln}"),
        ("Position", pos),
        ("Email", _safe_addr(email)),
    ]

    extra = (
        '<tr><td style="padding:0 40px 28px;">'
        f'<p style="margin:0;font-size:14px;color:#555555;line-height:1.6;">{resume_note}</p>'
        "</td></tr>"
    )

    attachments = []
    if resume_bytes and resume_filename:
        attachments.append(
            {
                "filename": resume_filename,
                "content": base64.b64encode(resume_bytes).decode("utf-8"),
            }
        )

    try:
        content = (
            '<tr><td style="padding:36px 40px 28px;">'
            '<h2 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0C2D70;">'
            "New Job Application Received</h2>"
            f"{_data_table(rows)}"
            "</td></tr>"
            f"{extra}"
        )
        _send(
            to=COMPANY_EMAIL,
            subject=f"New Job Application: {_safe_hdr(position)} — {_safe_hdr(f'{first_name} {last_name}')}",
            html=_wrap(content, _notif_footer("Job Application Alert")),
            attachments=attachments or None,
        )
    except Exception:
        logger.exception("Company job application notification email failed")
