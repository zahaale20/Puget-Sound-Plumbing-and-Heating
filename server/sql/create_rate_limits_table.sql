-- Rate-limits table for DB-backed rate limiter
-- Run once against the Supabase project.
CREATE TABLE IF NOT EXISTS rate_limits (
    ip_address  TEXT           NOT NULL,
    endpoint    TEXT           NOT NULL,
    request_count INTEGER      NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    PRIMARY KEY (ip_address, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window
    ON rate_limits (window_start);
