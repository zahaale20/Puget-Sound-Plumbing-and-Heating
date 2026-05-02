from unittest.mock import MagicMock, patch

from dependencies import get_client_ip


def _make_request(headers=None, client_host="10.0.0.1"):
    req = MagicMock()
    req.headers = headers or {}
    req.client = MagicMock()
    req.client.host = client_host
    return req


class TestGetClientIp:
    def test_returns_client_host_by_default(self) -> None:
        req = _make_request(client_host="192.168.1.1")
        assert get_client_ip(req) == "192.168.1.1"

    def test_ignores_forwarded_when_trust_disabled(self) -> None:
        req = _make_request(
            headers={"x-forwarded-for": "1.2.3.4, 5.6.7.8"},
            client_host="10.0.0.1",
        )
        with patch("dependencies.TRUST_PROXY_HEADERS", False):
            assert get_client_ip(req) == "10.0.0.1"

    def test_uses_forwarded_when_trust_enabled(self) -> None:
        req = _make_request(
            headers={"x-forwarded-for": "1.2.3.4, 5.6.7.8"},
            client_host="10.0.0.1",
        )
        with patch("dependencies.TRUST_PROXY_HEADERS", True), \
             patch("dependencies.TRUSTED_PROXY_IPS", "10.0.0.1,5.6.7.8"):
            assert get_client_ip(req) == "1.2.3.4"

    def test_single_forwarded_ip(self) -> None:
        req = _make_request(headers={"x-forwarded-for": "9.9.9.9"}, client_host="10.0.0.1")
        with patch("dependencies.TRUST_PROXY_HEADERS", True), \
             patch("dependencies.TRUSTED_PROXY_IPS", "10.0.0.1"):
            assert get_client_ip(req) == "9.9.9.9"

    def test_ignores_forwarded_when_peer_is_not_trusted(self) -> None:
        req = _make_request(
            headers={"x-forwarded-for": "203.0.113.99"},
            client_host="10.0.0.1",
        )
        with patch("dependencies.TRUST_PROXY_HEADERS", True), \
             patch("dependencies.TRUSTED_PROXY_IPS", "127.0.0.1"):
            assert get_client_ip(req) == "10.0.0.1"

    def test_uses_nearest_untrusted_forwarded_ip(self) -> None:
        req = _make_request(
            headers={"x-forwarded-for": "198.51.100.200, 198.51.100.10"},
            client_host="10.0.0.1",
        )
        with patch("dependencies.TRUST_PROXY_HEADERS", True), \
             patch("dependencies.TRUSTED_PROXY_IPS", "10.0.0.1"):
            assert get_client_ip(req) == "198.51.100.10"

    def test_skips_invalid_forwarded_entries(self) -> None:
        req = _make_request(
            headers={"x-forwarded-for": "not-an-ip, 203.0.113.42"},
            client_host="10.0.0.1",
        )
        with patch("dependencies.TRUST_PROXY_HEADERS", True), \
             patch("dependencies.TRUSTED_PROXY_IPS", "10.0.0.1"):
            assert get_client_ip(req) == "203.0.113.42"

    def test_no_client_returns_fallback(self) -> None:
        req = MagicMock()
        req.headers = {}
        req.client = None
        with patch("dependencies.TRUST_PROXY_HEADERS", False):
            assert get_client_ip(req) == "0.0.0.0"
