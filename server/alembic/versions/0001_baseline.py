"""baseline schema captured from the existing Supabase database

Revision ID: 0001_baseline
Revises:
Create Date: 2025-01-01 00:00:00.000000

This migration is idempotent (`IF NOT EXISTS` everywhere) so it can be
applied against the production database — which already contains these
tables — without effect, while also bootstrapping fresh environments
(docker-compose, CI, preview branches).

Mixed-case quoted table names ("Schedule Online", etc.) match the names
already used by `INSERT INTO ...` statements in the route handlers. We
preserve them rather than renaming, because renaming would require a
coordinated production data migration. Future tables should use lowercase
snake_case.
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op


revision: str = "0001_baseline"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ----- Form submission tables ---------------------------------------
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS "Schedule Online" (
            id          BIGSERIAL PRIMARY KEY,
            first_name  TEXT NOT NULL,
            last_name   TEXT NOT NULL,
            email       TEXT NOT NULL,
            phone       TEXT NOT NULL,
            message     TEXT,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT  schedule_online_unique UNIQUE (email, phone)
        )
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS "Newsletter" (
            id          BIGSERIAL PRIMARY KEY,
            email       TEXT NOT NULL UNIQUE,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS "Redeemed Offers" (
            id                BIGSERIAL PRIMARY KEY,
            first_name        TEXT NOT NULL,
            last_name         TEXT NOT NULL,
            email             TEXT NOT NULL,
            phone             TEXT NOT NULL,
            coupon_id         TEXT NOT NULL,
            coupon_discount   TEXT,
            coupon_condition  TEXT,
            created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT redeemed_offers_unique UNIQUE (email, coupon_id)
        )
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS "DIY Permit Requests" (
            id                    BIGSERIAL PRIMARY KEY,
            first_name            TEXT NOT NULL,
            last_name             TEXT NOT NULL,
            email                 TEXT NOT NULL,
            phone                 TEXT NOT NULL,
            address               TEXT NOT NULL,
            city                  TEXT NOT NULL,
            state                 TEXT NOT NULL,
            zip_code              TEXT NOT NULL,
            project_description   TEXT,
            inspection            BOOLEAN NOT NULL DEFAULT FALSE,
            created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT diy_permit_unique UNIQUE (email, address)
        )
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS "Job Applications" (
            id          BIGSERIAL PRIMARY KEY,
            first_name  TEXT NOT NULL,
            last_name   TEXT NOT NULL,
            email       TEXT NOT NULL,
            phone       TEXT NOT NULL,
            position    TEXT NOT NULL,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT  job_applications_unique UNIQUE (email, position)
        )
        """
    )

    # ----- Blog content -------------------------------------------------
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS public."Blog Posts" (
            id                       BIGSERIAL PRIMARY KEY,
            title                    TEXT,
            slug                     TEXT UNIQUE,
            source_url               TEXT,
            published_date           TEXT,
            author                   TEXT,
            views                    INTEGER NOT NULL DEFAULT 0,
            content_json             JSONB,
            featured_image_s3_key    TEXT,
            content_image_s3_keys    TEXT[]
        )
        """
    )
    op.execute(
        'CREATE INDEX IF NOT EXISTS blog_posts_published_date_idx '
        'ON public."Blog Posts" (published_date DESC NULLS LAST)'
    )

    # ----- Rate limiter -------------------------------------------------
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS rate_limits (
            ip_address     TEXT NOT NULL,
            endpoint       TEXT NOT NULL,
            request_count  INTEGER NOT NULL DEFAULT 1,
            window_start   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (ip_address, endpoint)
        )
        """
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS rate_limits_window_start_idx "
        "ON rate_limits (window_start)"
    )


def downgrade() -> None:
    # Destructive — only intended for fresh dev environments. We deliberately
    # do NOT drop tables in production. Operators should refuse to run a
    # downgrade past the baseline against a real DB.
    op.execute("DROP TABLE IF EXISTS rate_limits")
    op.execute('DROP TABLE IF EXISTS public."Blog Posts"')
    op.execute('DROP TABLE IF EXISTS "Job Applications"')
    op.execute('DROP TABLE IF EXISTS "DIY Permit Requests"')
    op.execute('DROP TABLE IF EXISTS "Redeemed Offers"')
    op.execute('DROP TABLE IF EXISTS "Newsletter"')
    op.execute('DROP TABLE IF EXISTS "Schedule Online"')
