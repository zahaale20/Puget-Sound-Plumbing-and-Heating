import asyncio
import contextlib
import runpy
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient


class TestDatabaseCoverage:
    def test_get_db_connection_yields_and_returns_to_pool(self, monkeypatch):
        import database

        connection = MagicMock()

        monkeypatch.setenv("SUPABASE_PROJECT_ID", "testproject")
        monkeypatch.setenv("SUPABASE_PASSWORD", "pass")
        monkeypatch.setenv("SUPABASE_HOST", "host")
        monkeypatch.setenv("SUPABASE_PORT", "5432")
        monkeypatch.setenv("SUPABASE_DBNAME", "dbname")

        pool_mock = MagicMock()
        pool_mock.getconn.return_value = connection
        monkeypatch.setattr(database, "_pool", pool_mock)

        with database.get_db_connection() as conn:
            assert conn is connection

        pool_mock.getconn.assert_called_once()
        pool_mock.putconn.assert_called_once_with(connection)

    def test_test_db_success(self, monkeypatch):
        import database

        cursor = MagicMock()
        cursor.fetchone.return_value = ["2026-04-04T12:00:00Z"]

        conn = MagicMock()
        conn.cursor.return_value = contextlib.nullcontext(cursor)

        @contextlib.contextmanager
        def fake_connection():
            yield conn

        monkeypatch.setattr(database, "get_db_connection", fake_connection)

        result = database.test_db()

        assert result == "2026-04-04T12:00:00Z"
        cursor.execute.assert_called_once_with("SELECT NOW();")

    def test_test_db_failure_returns_fallback(self, monkeypatch):
        import database

        monkeypatch.setattr(database, "get_db_connection", MagicMock(side_effect=Exception("db down")))
        log_exception = MagicMock()
        monkeypatch.setattr(database.logger, "exception", log_exception)

        result = database.test_db()

        assert result == "Database connection error"
        log_exception.assert_called_once()


class TestMainCoverage:
    def test_normalize_hostname_blank_returns_none(self):
        from main import _normalize_hostname

        assert _normalize_hostname("   ") is None

    def test_root_route_and_security_headers_http(self):
        from main import app

        client = TestClient(app, base_url="http://localhost")
        response = client.get("/")

        assert response.status_code == 200
        assert response.json() == {"status": "PSPAH API is running"}
        assert response.headers["x-content-type-options"] == "nosniff"
        assert response.headers["x-frame-options"] == "DENY"
        assert response.headers["referrer-policy"] == "strict-origin-when-cross-origin"
        assert response.headers["permissions-policy"] == "camera=(), microphone=(), geolocation=()"
        assert "strict-transport-security" not in response.headers

    def test_security_headers_https_sets_hsts(self):
        from main import app

        client = TestClient(app, base_url="https://localhost")
        response = client.get("/")

        assert response.status_code == 200
        assert response.headers["strict-transport-security"] == "max-age=31536000; includeSubDomains"

    def test_main_module_invokes_uvicorn_run(self, monkeypatch):
        run_mock = MagicMock()
        monkeypatch.setenv("ENABLE_HTTPS_REDIRECT", "true")
        monkeypatch.setattr("uvicorn.run", run_mock)

        runpy.run_module("main", run_name="__main__")

        run_mock.assert_called_once_with("main:app", host="0.0.0.0", port=8001, reload=True)


class TestImagesCoverage:
    def test_get_client_ip_prefers_forwarded_header_when_enabled(self, monkeypatch):
        import dependencies

        monkeypatch.setattr(dependencies, "TRUST_PROXY_HEADERS", True)
        req = MagicMock()
        req.headers.get.return_value = "203.0.113.10, 198.51.100.2"
        req.client.host = "10.0.0.1"

        assert dependencies.get_client_ip(req) == "203.0.113.10"

    def test_get_client_ip_falls_back_to_default(self, monkeypatch):
        import dependencies

        monkeypatch.setattr(dependencies, "TRUST_PROXY_HEADERS", False)
        req = MagicMock()
        req.headers.get.return_value = None
        req.client = None

        assert dependencies.get_client_ip(req) == "0.0.0.0"

    def test_get_image_url_rate_limited(self, monkeypatch):
        import routes.images as images
        from fastapi import HTTPException

        monkeypatch.setattr(images, "check_rate_limit", lambda ip, endpoint: (False, "Too many requests"))
        req = MagicMock()
        req.headers.get.return_value = None
        req.client.host = "198.51.100.20"

        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(images.get_image_url("public/hero.jpg", req=req))

        assert exc_info.value.status_code == 429

    def test_get_image_url_missing_supabase_url(self, monkeypatch):
        import routes.images as images
        from fastapi import HTTPException

        monkeypatch.setattr(images.storage_service, "supabase_url", None)

        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(images.get_image_url("logo/hero.webp", req=None))

        assert exc_info.value.status_code == 404

    def test_get_image_url_invalid_path(self, monkeypatch):
        import routes.images as images
        from fastapi import HTTPException

        monkeypatch.setattr(images.storage_service, "supabase_url", "https://example.supabase.co")
        monkeypatch.setattr(images.storage_service, "get_image_url", lambda image_name: None)

        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(images.get_image_url("invalid/path.jpg", req=None))

        assert exc_info.value.status_code == 400

    def test_get_image_url_success(self, monkeypatch):
        import routes.images as images

        monkeypatch.setattr(images.storage_service, "supabase_url", "https://example.supabase.co")
        monkeypatch.setattr(
            images.storage_service,
            "get_image_url",
            lambda image_name: f"https://example.supabase.co/storage/v1/object/public/assets/logo/{image_name}",
        )

        response = asyncio.run(images.get_image_url("logo/hero.webp", req=None))

        assert response == {"url": "https://example.supabase.co/storage/v1/object/public/assets/logo/logo/hero.webp"}