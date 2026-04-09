import os
from unittest.mock import patch, MagicMock


class TestNormalizeHostname:
    def test_simple_hostname(self):
        from main import _normalize_hostname
        assert _normalize_hostname("example.com") == "example.com"

    def test_strips_and_lowercases(self):
        from main import _normalize_hostname
        assert _normalize_hostname("  Example.COM  ") == "example.com"

    def test_extracts_from_url(self):
        from main import _normalize_hostname
        assert _normalize_hostname("https://example.com/path") == "example.com"

    def test_strips_port(self):
        from main import _normalize_hostname
        assert _normalize_hostname("example.com:8080") == "example.com"

    def test_none_returns_none(self):
        from main import _normalize_hostname
        assert _normalize_hostname(None) is None

    def test_empty_string_returns_none(self):
        from main import _normalize_hostname
        assert _normalize_hostname("") is None

    def test_whitespace_only_returns_none(self):
        from main import _normalize_hostname
        assert _normalize_hostname("   ") is None


class TestBuildAllowedHosts:
    def test_default_hosts_included(self):
        from main import _build_allowed_hosts
        hosts = _build_allowed_hosts()
        assert "localhost" in hosts
        assert "127.0.0.1" in hosts
        assert "pugetsoundplumbing.com" in hosts

    def test_vercel_host_added(self):
        from main import _build_allowed_hosts
        with patch.dict(os.environ, {"VERCEL_URL": "my-app.vercel.app"}):
            hosts = _build_allowed_hosts()
            assert "my-app.vercel.app" in hosts
            assert "*.vercel.app" in hosts

    def test_custom_allowed_hosts(self):
        from main import _build_allowed_hosts
        with patch.dict(os.environ, {"ALLOWED_HOSTS": "custom.com,other.com"}, clear=False):
            hosts = _build_allowed_hosts()
            assert "custom.com" in hosts
            assert "other.com" in hosts

    def test_deduplication(self):
        from main import _build_allowed_hosts
        with patch.dict(os.environ, {"ALLOWED_HOSTS": "localhost,localhost"}, clear=False):
            hosts = _build_allowed_hosts()
            assert hosts.count("localhost") == 1


class TestBuildCorsOrigins:
    def test_uses_env_when_set(self):
        from main import _build_cors_origins
        with patch.dict(os.environ, {"CORS_ORIGINS": "https://a.com,https://b.com"}):
            origins = _build_cors_origins()
            assert origins == ["https://a.com", "https://b.com"]

    def test_defaults_when_env_empty(self):
        from main import _build_cors_origins
        with patch.dict(os.environ, {"CORS_ORIGINS": ""}):
            origins = _build_cors_origins()
            assert "http://localhost:5173" in origins


class TestRootEndpoint:
    def test_root_returns_status(self, client):
        resp = client.get("/")
        assert resp.status_code == 200
        assert resp.json()["status"] == "PSPAH API is running"


class TestHealthEndpoint:
    def test_healthy(self, client):
        with patch("database.test_db", return_value="2025-01-01"):
            resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "healthy"

    def test_unhealthy(self, client):
        with patch("database.test_db", return_value=False):
            resp = client.get("/health")
        assert resp.status_code == 503
        assert resp.json()["status"] == "unhealthy"


class TestSecurityHeaders:
    def test_security_headers_present(self, client):
        resp = client.get("/")
        assert resp.headers.get("X-Content-Type-Options") == "nosniff"
        assert resp.headers.get("X-Frame-Options") == "DENY"
        assert resp.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
        assert "camera=()" in resp.headers.get("Permissions-Policy", "")
