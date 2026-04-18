"""Real-Postgres tests for `services/rate_limiter.py`.

The unit suite mocks `services.rate_limiter.get_db_connection`, which
means the upsert SQL — including `MAKE_INTERVAL`, the `ON CONFLICT`
branch, and the `EXTRACT(EPOCH FROM ...)::int AS retry_after`
expression — has never been executed by the test suite. Any typo or
behavioural change in that one query would ship green.

These tests run the real `check_rate_limit` against the real `rate_limits`
table and verify:

- the counter increments per call within a window
- the limit is enforced once `count > max_requests`
- crossing into a new window resets the counter (we simulate this by
  rewriting `window_start` rather than waiting an hour)
- the cleanup query removes only stale rows
- unknown endpoints are pass-through
"""

from __future__ import annotations

from datetime import timedelta

import pytest

from services import rate_limiter

pytestmark = [pytest.mark.asyncio, pytest.mark.integration]


async def _set_window_start(db, ip: str, endpoint: str, *, age: timedelta) -> None:
    """Backdate the `window_start` for a row to simulate window expiry."""
    async with db.get_db_connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "UPDATE rate_limits SET window_start = NOW() - %s::interval "
                "WHERE ip_address = %s AND endpoint = %s",
                (f"{int(age.total_seconds())} seconds", ip, endpoint),
            )
        await conn.commit()


async def test_unknown_endpoint_is_pass_through(db) -> None:
    allowed, msg, retry = await rate_limiter.check_rate_limit("1.2.3.4", "no-such-endpoint")
    assert allowed is True
    assert retry == 0
    assert "not rate limited" in msg.lower()


async def test_counter_increments_and_limit_is_enforced(db) -> None:
    ip = "10.0.0.1"
    endpoint = "newsletter"  # configured limit: 5 / hour

    # First 5 requests are allowed.
    for i in range(5):
        allowed, _, _ = await rate_limiter.check_rate_limit(ip, endpoint)
        assert allowed is True, f"request {i + 1} should be allowed"

    # 6th request crosses the limit.
    allowed, msg, retry_after = await rate_limiter.check_rate_limit(ip, endpoint)
    assert allowed is False
    assert "Rate limit exceeded" in msg
    assert retry_after > 0


async def test_window_expiry_resets_counter(db) -> None:
    ip = "10.0.0.2"
    endpoint = "newsletter"

    # Fill the bucket.
    for _ in range(6):
        await rate_limiter.check_rate_limit(ip, endpoint)
    allowed, _, _ = await rate_limiter.check_rate_limit(ip, endpoint)
    assert allowed is False

    # Backdate the window past the 1-hour limit and try again. The
    # `MAKE_INTERVAL(secs => %s)` branch in the upsert should reset
    # request_count to 1 and re-stamp window_start.
    await _set_window_start(db, ip, endpoint, age=timedelta(hours=2))

    allowed, _, _ = await rate_limiter.check_rate_limit(ip, endpoint)
    assert allowed is True

    # And we should now be back at count=1, so 4 more pass.
    for _ in range(4):
        allowed, _, _ = await rate_limiter.check_rate_limit(ip, endpoint)
        assert allowed is True


async def test_per_ip_isolation(db) -> None:
    """Two IPs hitting the same endpoint must not share a counter."""
    endpoint = "newsletter"

    for _ in range(5):
        await rate_limiter.check_rate_limit("10.0.0.3", endpoint)
    blocked, _, _ = await rate_limiter.check_rate_limit("10.0.0.3", endpoint)
    assert blocked is False

    # Different IP — independent bucket.
    allowed, _, _ = await rate_limiter.check_rate_limit("10.0.0.4", endpoint)
    assert allowed is True


async def test_cleanup_removes_only_stale_rows(db) -> None:
    """`_cleanup_expired` should delete rows older than 24h, leave the rest."""
    fresh_ip = "10.0.1.1"
    stale_ip = "10.0.1.2"
    await rate_limiter.check_rate_limit(fresh_ip, "newsletter")
    await rate_limiter.check_rate_limit(stale_ip, "newsletter")
    await _set_window_start(db, stale_ip, "newsletter", age=timedelta(hours=25))

    await rate_limiter._cleanup_expired()

    async with db.get_db_connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT ip_address FROM rate_limits ORDER BY ip_address"
            )
            rows = await cur.fetchall()

    ips = [r[0] for r in rows]
    assert fresh_ip in ips
    assert stale_ip not in ips


async def test_check_rate_limit_fails_open_when_query_breaks(db, monkeypatch) -> None:
    """Documented behaviour: a broken rate limiter must NOT block traffic.

    Simulated by patching the module-level SQL with garbage; the function
    should swallow the exception and return allow=True.
    """
    monkeypatch.setattr(rate_limiter, "_UPSERT_SQL", "SELECT * FROM nonexistent_table")
    allowed, msg, retry = await rate_limiter.check_rate_limit("10.0.2.1", "newsletter")
    assert allowed is True
    assert retry == 0
