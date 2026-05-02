"""store DIY permit inspection as constrained text

Revision ID: 0003_diy_permit_inspection_text
Revises: 0002_offers_dedup_unique
Create Date: 2026-05-01 00:00:00.000000

Why
---
The API accepts three inspection statuses for DIY permit requests:
``yes``, ``no``, and ``unsure``. The previous database column was a
boolean, so the default ``unsure`` path could fail at insert time in
Postgres even though request validation accepted it. Persist the status
as constrained text so the database schema matches the application
contract.
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op


revision: str = "0003_diy_permit_inspection_text"
down_revision: Union[str, None] = "0002_offers_dedup_unique"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE "DIY Permit Requests"
            DROP CONSTRAINT IF EXISTS diy_permit_inspection_valid
        """
    )
    op.execute(
        """
        ALTER TABLE "DIY Permit Requests"
            ALTER COLUMN inspection DROP DEFAULT,
            ALTER COLUMN inspection TYPE TEXT USING (
                CASE
                    WHEN inspection::TEXT = 'true' THEN 'yes'
                    WHEN inspection::TEXT = 'false' THEN 'no'
                    WHEN inspection::TEXT IN ('yes', 'no', 'unsure') THEN inspection::TEXT
                    ELSE 'unsure'
                END
            ),
            ALTER COLUMN inspection SET DEFAULT 'unsure',
            ALTER COLUMN inspection SET NOT NULL
        """
    )
    op.execute(
        """
        ALTER TABLE "DIY Permit Requests"
            ADD CONSTRAINT diy_permit_inspection_valid
            CHECK (inspection IN ('yes', 'no', 'unsure'))
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE "DIY Permit Requests"
            DROP CONSTRAINT IF EXISTS diy_permit_inspection_valid
        """
    )
    op.execute(
        """
        ALTER TABLE "DIY Permit Requests"
            ALTER COLUMN inspection DROP DEFAULT,
            ALTER COLUMN inspection TYPE BOOLEAN USING (inspection = 'yes'),
            ALTER COLUMN inspection SET DEFAULT FALSE,
            ALTER COLUMN inspection SET NOT NULL
        """
    )