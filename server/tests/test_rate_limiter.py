from unittest.mock import patch

import pytest

from services.rate_limiter import RATE_LIMITS, check_rate_limit
from tests.conftest import make_async_cursor, make_async_db


class TestRateLimitConfig:
    def test_known_endpoints_exist(self) -> None:
        assert "schedule" in RATE_LIMITS
        assert "newsletter" in RATE_LIMITS
        assert "images" in RATE_LIMITS
        assert "blog-views" in RATE_LIMITS


class TestCheckRateLimit:
    @pytest.mark.asyncio
    async def test_unknown_endpoint_allowed(self) -> None:
        allowed, msg, retry_after = await check_rate_limit("1.2.3.4", "unknown-endpoint")
        assert allowed is True
        assert retry_after == 0

    @pytest.mark.asyncio
    async def test_allowed_under_limit(self) -> None:
        cur = make_async_cursor(fetchone=(1, 3500))
        factory, _ = make_async_db(cur)
        with patch("services.rate_limiter.get_db_connection", factory), \
             patch("services.rate_limiter.random") as mock_random:
            mock_random.random.return_value = 0.5  # no cleanup
            allowed, msg, retry_after = await check_rate_limit("1.2.3.4", "schedule")
        assert allowed is True
        assert retry_after == 0

    @pytest.mark.asyncio
    async def test_blocked_over_limit(self) -> None:
        cur = make_async_cursor(fetchone=(9999, 1800))
        factory, _ = make_async_db(cur)
        with patch("services.rate_limiter.get_db_connection", factory), \
             patch("services.rate_limiter.random") as mock_random:
            mock_random.random.return_value = 0.5
            allowed, msg, retry_after = await check_rate_limit("1.2.3.4", "schedule")
        assert allowed is False
        assert "Rate limit exceeded" in msg
        assert retry_after == 1800

    @pytest.mark.asyncio
    async def test_db_failure_fails_open(self) -> None:
        with patch("services.rate_limiter.get_db_connection", side_effect=Exception("db down")):
            allowed, msg, retry_after = await check_rate_limit("1.2.3.4", "schedule")
        assert allowed is True
