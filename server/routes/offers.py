import logging
import re
import secrets
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from fastapi.responses import JSONResponse

from database import get_db_connection
from dependencies import require_rate_limit
from models.requests import RedeemOfferRequest
from services.captcha_service import verify_captcha
from services.email_service import send_coupon_confirmation, send_coupon_notification
from utils import (
    duplicate_response,
    is_duplicate_error,
    is_undefined_object_error,
    normalize_email,
    normalize_text,
    raise_internal_error,
)

router = APIRouter(prefix="/api", tags=["offers"])
logger = logging.getLogger(__name__)


async def _safe_send_coupon_notification(*args: Any, **kwargs: Any) -> None:
    """Best-effort company notification; never propagates errors.

    ``send_coupon_notification`` is ``async`` (it awaits the Resend SMTP
    client). It MUST be awaited here — calling it without ``await``
    silently produces an un-awaited coroutine and the company never gets
    notified, which was the prior behavior.
    """
    try:
        await send_coupon_notification(*args, **kwargs)
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


async def _redeem_offer_legacy_insert(
    first_name: str,
    last_name: str,
    email: str,
    phone: str,
    coupon_id: str,
    coupon_discount: str,
    coupon_condition: str,
) -> int | None:
    """Race-safe SELECT-then-INSERT used when the dedup constraint is missing.

    In environments where migration ``0002_offers_dedup_unique`` has not
    yet been applied (e.g. a Vercel deploy that ships new route code
    before any operator runs ``alembic upgrade head``), the primary
    ``ON CONFLICT ON CONSTRAINT redeemed_offers_dedup_unique`` path
    raises SQLSTATE 42704. This fallback preserves the "don't email
    twice" invariant by:
      1. Acquiring ``pg_advisory_xact_lock`` keyed on the dedup tuple,
         so concurrent requests for the same (email, phone,
         coupon_discount, coupon_condition) serialize through Postgres.
      2. Checking for an existing matching row inside the same
         transaction.
      3. Inserting only if none was found.
    The lock is released automatically at COMMIT/ROLLBACK.
    Returns the inserted id, or ``None`` if a matching row already
    existed.
    """
    lock_key = f"redeem-offer:{email}|{phone}|{coupon_discount}|{coupon_condition}"
    async with get_db_connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT pg_advisory_xact_lock(hashtext(%s))",
                (lock_key,),
            )
            await cur.execute(
                """
                SELECT id FROM "Redeemed Offers"
                WHERE email = %s
                  AND phone = %s
                  AND COALESCE(coupon_discount, '') = COALESCE(%s, '')
                  AND COALESCE(coupon_condition, '') = COALESCE(%s, '')
                LIMIT 1
                """,
                (email, phone, coupon_discount, coupon_condition),
            )
            existing = await cur.fetchone()
            if existing is not None:
                await conn.commit()
                return None

            await cur.execute(
                """
                INSERT INTO "Redeemed Offers"
                    (first_name, last_name, email, phone, coupon_id,
                     coupon_discount, coupon_condition)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (
                    first_name, last_name, email, phone, coupon_id,
                    coupon_discount, coupon_condition,
                ),
            )
            inserted = await cur.fetchone()
        await conn.commit()
    return inserted[0] if inserted else None


@router.post("/redeem-offer", dependencies=[Depends(require_rate_limit("redeem-offer"))], response_model=None)
async def redeem_offer(request: RedeemOfferRequest, req: Request, background_tasks: BackgroundTasks) -> dict[str, Any] | JSONResponse:
    """Send coupon confirmation, persist redemption, then notify company."""
    if not await verify_captcha(request.captchaToken):
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
        # 1) Atomic insert-or-no-op against the dedup unique constraint
        #    (email, phone, coupon_discount, coupon_condition). RETURNING id
        #    yields a row only when this call actually inserted — that is
        #    the contract that prevents two concurrent submissions from
        #    each emailing a coupon. The previous SELECT-then-INSERT split
        #    raced: both requests passed the precheck and both sent email
        #    before the DB caught the second insert.
        inserted_id = None
        try:
            async with get_db_connection() as conn:
                async with conn.cursor() as cur:
                    await cur.execute(
                        """
                        INSERT INTO "Redeemed Offers"
                            (first_name, last_name, email, phone, coupon_id,
                             coupon_discount, coupon_condition)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT ON CONSTRAINT redeemed_offers_dedup_unique
                            DO NOTHING
                        RETURNING id
                        """,
                        (
                            first_name, last_name, email, phone, coupon_id,
                            request.couponDiscount, request.couponCondition,
                        ),
                    )
                    row = await cur.fetchone()
                await conn.commit()
            if row is not None:
                inserted_id = row[0]
        except Exception as insert_error:
            # Older deployments may not yet have the dedup constraint
            # (migration 0002_offers_dedup_unique). In that narrow window
            # we still want to fail closed on a unique-violation rather
            # than emailing twice.
            if is_duplicate_error(insert_error):
                inserted_id = None
            elif is_undefined_object_error(insert_error):
                # Production Postgres has not yet had
                # ``alembic upgrade head`` applied, so the named
                # constraint referenced by ON CONFLICT does not exist
                # (SQLSTATE 42704). Fall back to a transactional
                # SELECT-then-INSERT serialized by an advisory lock
                # keyed on the dedup tuple, so two concurrent
                # submissions for the same offer cannot both email.
                inserted_id = await _redeem_offer_legacy_insert(
                    first_name, last_name, email, phone, coupon_id,
                    request.couponDiscount, request.couponCondition,
                )
            else:
                raise

        if inserted_id is None:
            return duplicate_response(
                "This coupon request already exists for this contact. "
                "Please check your email for your coupon."
            )

        # 2) Row is committed; now send the coupon email. ``send_coupon_
        #    confirmation`` is ``async`` and MUST be awaited — without
        #    ``await`` it silently produces an unsent coroutine, which
        #    would defeat the whole point of this refactor ("don't email
        #    twice" is trivially true if we never email at all). If the
        #    send fails we delete the just-inserted row best-effort so
        #    the customer's retry is not blocked by the dedup constraint,
        #    then propagate the 500.
        try:
            await send_coupon_confirmation(
                email, first_name, coupon_id,
                request.couponDiscount, request.couponCondition,
            )
        except Exception:
            try:
                async with get_db_connection() as conn:
                    async with conn.cursor() as cur:
                        await cur.execute(
                            'DELETE FROM "Redeemed Offers" WHERE id = %s',
                            (inserted_id,),
                        )
                    await conn.commit()
            except Exception:
                logger.exception(
                    "Failed to roll back redeemed_offers row %s after "
                    "send_coupon_confirmation error; manual cleanup may "
                    "be required to allow customer retry.",
                    inserted_id,
                )
            raise

        # 3) Notify the company (awaited inline; BackgroundTasks is not
        # durable on serverless).
        await _safe_send_coupon_notification(
            email, first_name, last_name, phone, coupon_id,
            request.couponDiscount, request.couponCondition,
        )

        return {"success": True, "emailStatus": "sent"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise_internal_error("redeem_offer failed", e)
