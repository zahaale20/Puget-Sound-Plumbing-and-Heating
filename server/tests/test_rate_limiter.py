from unittest.mock import patch, MagicMock
from contextlib import contextmanager
from services.rate_limiter import check_rate_limit, RATE_LIMITS


class TestRateLimitConfig:
    def test_known_endpoints_exist(self):
        assert "schedule" in RATE_LIMITS
        assert "newsletter" in RATE_LIMITS
        assert "images" in RATE_LIMITS
        assert "blog-views" in RATE_LIMITS


class TestCheckRateLimit:
    def test_unknown_endpoint_allowed(self):
        allowed, msg = check_rate_limit("1.2.3.4", "unknown-endpoint")
        assert allowed is True

    def test_allowed_under_limit(self):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = (1,)
        mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
        mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

        @contextmanager
        def _ctx():
            yield mock_conn

        with patch("services.rate_limiter.get_db_connection", _ctx), \
             patch("services.rate_limiter.random") as mock_random:
            mock_random.random.return_value = 0.5  # no cleanup
            allowed, msg = check_rate_limit("1.2.3.4", "schedule")
        assert allowed is True

    def test_blocked_over_limit(self):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = (9999,)
        mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
        mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

        @contextmanager
        def _ctx():
            yield mock_conn

        with patch("services.rate_limiter.get_db_connection", _ctx), \
             patch("services.rate_limiter.random") as mock_random:
            mock_random.random.return_value = 0.5
            allowed, msg = check_rate_limit("1.2.3.4", "schedule")
        assert allowed is False
        assert "Rate limit exceeded" in msg

    def test_db_failure_fails_open(self):
        with patch("services.rate_limiter.get_db_connection", side_effect=Exception("db down")):
            allowed, msg = check_rate_limit("1.2.3.4", "schedule")
        assert allowed is True
