-- Schema for storing DIY plumbing permit requests.
-- Run in Supabase SQL editor or via psql.

CREATE TABLE IF NOT EXISTS public."DIY Permit Requests" (
    id          BIGSERIAL PRIMARY KEY,
    first_name  TEXT NOT NULL,
    last_name   TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT NOT NULL,
    address     TEXT NOT NULL,
    city        TEXT NOT NULL DEFAULT '',
    state       TEXT NOT NULL DEFAULT '',
    zip_code    TEXT NOT NULL DEFAULT '',
    project_description TEXT NOT NULL DEFAULT '',
    inspection  TEXT NOT NULL DEFAULT 'unsure' CHECK (inspection IN ('yes', 'no', 'unsure')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (email, phone, address)
);

CREATE INDEX IF NOT EXISTS idx_diy_permit_requests_email
    ON public."DIY Permit Requests" (email);

CREATE INDEX IF NOT EXISTS idx_diy_permit_requests_created_at
    ON public."DIY Permit Requests" (created_at DESC);
