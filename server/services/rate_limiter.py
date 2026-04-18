"""
Rate limiting utility for form submissions.
Uses Supabase PostgreSQL for persistent, cross-instance rate limiting.

Async-native: callers must `await check_rate_limit(...)`.
"""

import logging
import random

from database import get_db_connection

logger = logging.getLogger(__name__)

# Configuration: endpoint -> (max_requests, time_window_seconds)
RATE_LIMITS = {
    "schedule": (10, 3600),       # 10 requests per hour
    "newsletter": (5, 3600),      # 5 requests per hour
    "redeem-offer": (10, 3600),   # 10 requests per hour
    "diy-permit": (10, 3600),     # 10 requests per hour
    "job-application": (5, 3600), # 5 requests per hour
    "verify-captcha": (20, 3600), # 20 requests per hour
    "unsubscribe": (10, 3600),    # 10 requests per hour
    "images": (100, 3600),        # 100 requests per hour
    "blog-views": (30, 3600),     # 30 view increments per hour
}

_UPSERT_SQL = """
INSERT INTO rate_limits (ip_address, endpoint, request_count, window_start)
VALUES (%s, %s, 1, NOW())
ON CONFLICT (ip_address, endpoint)
DO UPDATE SET
    request_count = CASE
        WHEN rate_limits.window_start < NOW() - MAKE_INTERVAL(secs => %s)
        THEN 1
        ELSE rate_limits.request_count + 1
    END,
    window_start = CASE
        WHEN rate_limits.window_start < NOW() - MAKE_INTERVAL(secs => %s)
        THEN NOW()
        ELSE rate_limits.window_start
    END
RETURNING request_count,
        EXTRACT(EPOCH FROM (window_start + MAKE_INTERVAL(secs => %s) - NOW()))::int AS retry_after
"""

_CLEANUP_SQL = "DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '24 hours'"


async def check_rate_limit(ip_address: str, endpoint: str) -> tuple[bool, str, int]:
    """
    Check if request exceeds rate limit for given IP and endpoint.
    Atomic upsert on the rate_limits table.

    Returns (is_allowed, message, retry_after_seconds).
    """
    if endpoint not in RATE_LIMITS:
        return True, "Endpoint not rate limited", 0

    max_requests, window_seconds = RATE_LIMITS[endpoint]

    try:
        async with get_db_connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    _UPSERT_SQL,
                    (ip_address, endpoint, window_seconds, window_seconds, window_seconds),
                )
                row = await cur.fetchone()
                count = row[0]
                retry_after = max(0, row[1]) if row[1] is not None else window_seconds
            await conn.commit()

        # Probabilistic cleanup of expired records (1% chance per check)
        if random.random() < 0.01:  # nosec B311 - non-security usage
            await _cleanup_expired()

        if count > max_requests:
            logger.warning(
                "Rate limit hit: ip=%s endpoint=%s count=%d limit=%d",
                ip_address, endpoint, count, max_requests,
            )
            return False, f"Rate limit exceeded. Maximum {max_requests} requests per hour.", retry_after
        return True, "OK", 0
    except Exception as e:
        # Fail open — don't block requests if the rate limiter is broken
        logger.warning("Rate limit check failed, allowing request: %s", str(e))
        return True, "OK", 0


async def _cleanup_expired() -> None:
    """Remove rate limit records older than 24 hours."""
    try:
        async with get_db_connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute(_CLEANUP_SQL)
            await conn.commit()
    except Exception:
        logger.debug("Rate limit cleanup failed (non-critical)")
