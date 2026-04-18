"""add functional dedup unique constraint to "Redeemed Offers"

Revision ID: 0002_offers_dedup_unique
Revises: 0001_baseline
Create Date: 2026-04-17 00:00:00.000000

Why
---
The baseline schema has ``UNIQUE (email, coupon_id)`` on "Redeemed Offers".
That constraint cannot prevent a customer from redeeming the same offer
twice, because ``coupon_id`` is generated per request with a random suffix
(see ``routes.offers.generate_coupon_id``) — every submission produces a
new coupon_id, so the constraint never fires for a true duplicate
redemption.

The route handler used a SELECT-then-INSERT precheck against
``(email, phone, coupon_discount, coupon_condition)`` to detect duplicates.
That precheck races: two concurrent submissions both pass it, both insert,
and both customers get a coupon email before any constraint can object.

This migration introduces ``redeemed_offers_dedup_unique`` on
``(email, phone, coupon_discount, coupon_condition)`` so the database can
serve as the single source of truth for "same person already claimed this
offer". The route handler is then simplified to a single
``INSERT ... ON CONFLICT DO NOTHING RETURNING id`` and only sends the
coupon email when a row is actually inserted.

Pre-existing duplicate rows (already present in production from the racy
window) are collapsed to the earliest-inserted row before the constraint
is added; otherwise the ADD CONSTRAINT would fail. The cleanup is wrapped
in a transaction with the constraint creation so partial state is not
left behind.
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op


revision: str = "0002_offers_dedup_unique"
down_revision: Union[str, None] = "0001_baseline"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1) Collapse any pre-existing duplicates: keep the row with the
    #    smallest id for each (email, phone, coupon_discount, coupon_condition)
    #    tuple, delete the rest. NULLs in coupon_discount / coupon_condition
    #    are coalesced so they group together rather than being treated as
    #    distinct under SQL three-valued logic.
    op.execute(
        """
        WITH ranked AS (
            SELECT id,
                   ROW_NUMBER() OVER (
                       PARTITION BY email,
                                    phone,
                                    COALESCE(coupon_discount, ''),
                                    COALESCE(coupon_condition, '')
                       ORDER BY id
                   ) AS rn
            FROM "Redeemed Offers"
        )
        DELETE FROM "Redeemed Offers" o
        USING ranked r
        WHERE o.id = r.id
          AND r.rn > 1
        """
    )

    # 2) Add the dedup constraint idempotently. Postgres has no
    #    ``ADD CONSTRAINT ... IF NOT EXISTS``; swallow duplicate_object so
    #    re-running the migration against an already-patched DB is a no-op.
    op.execute(
        """
        DO $$
        BEGIN
            ALTER TABLE "Redeemed Offers"
                ADD CONSTRAINT redeemed_offers_dedup_unique
                UNIQUE (email, phone, coupon_discount, coupon_condition);
        EXCEPTION
            WHEN duplicate_object THEN NULL;
            WHEN duplicate_table  THEN NULL;
        END
        $$;
        """
    )


def downgrade() -> None:
    op.execute(
        'ALTER TABLE "Redeemed Offers" '
        "DROP CONSTRAINT IF EXISTS redeemed_offers_dedup_unique"
    )
