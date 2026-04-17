import re
import logging
import secrets
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from dependencies import require_rate_limit
from services.captcha_service import verify_captcha
from services.email_service import send_coupon_confirmation, send_coupon_notification
from database import get_db_connection
from utils import normalize_email, normalize_text, is_duplicate_error, duplicate_response, raise_internal_error
from models.requests import RedeemOfferRequest

router = APIRouter(prefix="/api", tags=["offers"])
logger = logging.getLogger(__name__)


def _safe_send_coupon_notification(*args, **kwargs) -> None:
    """Best-effort company notification; never propagates errors."""
    try:
        send_coupon_notification(*args, **kwargs)
    except Exception:
        logger.exception("Background send_coupon_notification failed")


def generate_coupon_id(coupon_discount: str) -> str:
    """Generate a unique coupon ID from the discount string plus a random suffix.

    Format: PSPAH-<discount_digits>-<6 random hex chars>
    Example: '$19.50 OFF' -> 'PSPAH-1950-a3f7c2'
    """
    match = re.search(r"\$(\d+)\.(\d+)", coupon_discount)
    suffix = secrets.token_hex(3)
    if match:
        return f"PSPAH-{match.group(1)}{match.group(2)}-{suffix}"
    return f"PSPAH-{abs(hash(coupon_discount)) % 10000:04d}-{suffix}"


@router.post("/redeem-offer", dependencies=[Depends(require_rate_limit("redeem-offer"))])
async def redeem_offer(request: RedeemOfferRequest, req: Request, background_tasks: BackgroundTasks):
    """Send coupon confirmation, persist redemption, then notify company."""
    if not verify_captcha(request.captchaToken):
        raise HTTPException(
            status_code=403,
            detail="Security verification failed. Please try again.",
        )

    first_name = normalize_text(request.firstName)
    last_name = normalize_text(request.lastName)
    email = normalize_email(request.email)
    phone = normalize_text(request.phone)
    coupon_id = generate_coupon_id(request.couponDiscount)

    try:
        # Fast duplicate check
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
                    return duplicate_response(
                        "This coupon request already exists for this contact. "
                        "Please check your email for your coupon."
                    )

        # 1) Send coupon email to customer first
        send_coupon_confirmation(
            email, first_name, coupon_id, request.couponDiscount, request.couponCondition
        )

        # 2) Persist the redemption
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                try:
                    cur.execute(
                        """
                        INSERT INTO "Redeemed Offers"
                            (first_name, last_name, email, phone, coupon_id,
                             coupon_discount, coupon_condition)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        """,
                        (
                            first_name, last_name, email, phone, coupon_id,
                            request.couponDiscount, request.couponCondition,
                        ),
                    )
                except Exception as insert_error:
                    if is_duplicate_error(insert_error):
                        conn.rollback()
                        return duplicate_response(
                            "This coupon request already exists for this contact. "
                            "Please check your email for your coupon."
                        )
                    raise
            conn.commit()

        # 3) Notify the company (non-critical, off the request critical path)
        background_tasks.add_task(
            _safe_send_coupon_notification,
            email, first_name, last_name, phone, coupon_id,
            request.couponDiscount, request.couponCondition,
        )

        return {"success": True, "emailStatus": "sent"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise_internal_error("redeem_offer failed", e)
