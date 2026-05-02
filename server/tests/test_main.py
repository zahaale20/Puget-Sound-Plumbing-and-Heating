import os
from unittest.mock import patch

import pytest


class TestNormalizeHostname:
    def test_simple_hostname(self) -> None:
        from main import _normalize_hostname
        assert _normalize_hostname("example.com") == "example.com"

    def test_strips_and_lowercases(self) -> None:
        from main import _normalize_hostname
        assert _normalize_hostname("  Example.COM  ") == "example.com"

    def test_extracts_from_url(self) -> None:
        from main import _normalize_hostname
        assert _normalize_hostname("https://example.com/path") == "example.com"

    def test_strips_port(self) -> None:
        from main import _normalize_hostname
        assert _normalize_hostname("example.com:8080") == "example.com"

    def test_none_returns_none(self) -> None:
        from main import _normalize_hostname
        assert _normalize_hostname(None) is None

    def test_empty_string_returns_none(self) -> None:
        from main import _normalize_hostname
        assert _normalize_hostname("") is None

    def test_whitespace_only_returns_none(self) -> None:
        from main import _normalize_hostname
        assert _normalize_hostname("   ") is None


class TestBuildAllowedHosts:
    def test_default_hosts_included(self) -> None:
        from main import _build_allowed_hosts
        hosts = _build_allowed_hosts()
        assert "localhost" in hosts
        assert "127.0.0.1" in hosts
        assert "pugetsoundplumbing.com" in hosts

    def test_vercel_host_added(self) -> None:
        from main import _build_allowed_hosts
        with patch.dict(os.environ, {"VERCEL_URL": "my-app.vercel.app"}):
            hosts = _build_allowed_hosts()
            assert "my-app.vercel.app" in hosts
            assert "*.vercel.app" in hosts

    def test_custom_allowed_hosts(self) -> None:
        from main import _build_allowed_hosts
        with patch.dict(os.environ, {"ALLOWED_HOSTS": "custom.com,other.com"}, clear=False):
            hosts = _build_allowed_hosts()
            assert "custom.com" in hosts
            assert "other.com" in hosts

    def test_deduplication(self) -> None:
        from main import _build_allowed_hosts
        with patch.dict(os.environ, {"ALLOWED_HOSTS": "localhost,localhost"}, clear=False):
            hosts = _build_allowed_hosts()
            assert hosts.count("localhost") == 1


class TestBuildCorsOrigins:
    def test_uses_env_when_set(self) -> None:
        from main import _build_cors_origins
        with patch.dict(os.environ, {"CORS_ORIGINS": "https://a.com,https://b.com"}):
            origins = _build_cors_origins()
            assert origins == ["https://a.com", "https://b.com"]

    def test_defaults_when_env_empty(self) -> None:
        from main import _build_cors_origins
        with patch.dict(os.environ, {"CORS_ORIGINS": ""}):
            origins = _build_cors_origins()
            assert "http://localhost:5173" in origins


class TestRootEndpoint:
    def test_root_returns_status(self, client) -> None:
        resp = client.get("/")
        assert resp.status_code == 200
        assert resp.json()["status"] == "PSPAH API is running"


class TestHealthEndpoint:
    def test_healthy(self, client) -> None:
        from unittest.mock import AsyncMock
        with patch("database.test_db", AsyncMock(return_value=True)):
            resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "healthy"

    def test_unhealthy(self, client) -> None:
        from unittest.mock import AsyncMock
        with patch("database.test_db", AsyncMock(return_value=False)):
            resp = client.get("/health")
        assert resp.status_code == 503
        assert resp.json()["status"] == "unhealthy"


class TestSecurityHeaders:
    def test_security_headers_present(self, client) -> None:
        resp = client.get("/")
        assert resp.headers.get("X-Content-Type-Options") == "nosniff"
        assert resp.headers.get("X-Frame-Options") == "DENY"
        assert resp.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
        assert "camera=()" in resp.headers.get("Permissions-Policy", "")


class TestLivenessEndpoint:
    def test_live_returns_200(self, client) -> None:
        resp = client.get("/health/live")
        assert resp.status_code == 200
        assert resp.json()["status"] == "alive"

    def test_live_requires_no_db(self, client) -> None:
        """Liveness must never touch the database."""
        with patch("database.test_db") as mock_db:
            resp = client.get("/health/live")
        mock_db.assert_not_called()
        assert resp.status_code == 200


class TestReadinessEndpoint:
    def test_ready_when_db_ok(self, client) -> None:
        from unittest.mock import AsyncMock
        with patch("database.test_db", AsyncMock(return_value=True)):
            resp = client.get("/health/ready")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ready"

    def test_not_ready_when_db_down(self, client) -> None:
        from unittest.mock import AsyncMock
        with patch("database.test_db", AsyncMock(return_value=False)):
            resp = client.get("/health/ready")
        assert resp.status_code == 503
        assert resp.json()["status"] == "not_ready"


class TestMetricsEndpoint:
    def test_metrics_disabled_by_default(self, client, monkeypatch) -> None:
        monkeypatch.setenv("ENABLE_METRICS", "false")
        resp = client.get("/metrics")
        assert resp.status_code == 404

    def test_metrics_enabled_no_token(self, client, monkeypatch) -> None:
        monkeypatch.setenv("ENABLE_METRICS", "true")
        monkeypatch.delenv("METRICS_TOKEN", raising=False)
        pytest.importorskip("prometheus_client")
        with patch("main.is_metrics_enabled", return_value=True):
            resp = client.get("/metrics")
            assert resp.status_code == 200

    def test_metrics_token_enforced(self, client, monkeypatch) -> None:
        monkeypatch.setenv("METRICS_TOKEN", "secret-token")
        with patch("main.is_metrics_enabled", return_value=True):
            # No token — expect 401
            resp = client.get("/metrics")
            assert resp.status_code == 401

            # Wrong token — expect 401
            resp = client.get("/metrics", headers={"Authorization": "Bearer wrong"})
            assert resp.status_code == 401

    def test_metrics_token_accepted(self, client, monkeypatch) -> None:
        monkeypatch.setenv("METRICS_TOKEN", "secret-token")
        with patch("main.is_metrics_enabled", return_value=True):
            try:
                from prometheus_client import generate_latest  # noqa: F401
                resp = client.get("/metrics", headers={"Authorization": "Bearer secret-token"})
                assert resp.status_code == 200
            except ImportError:
                pass
