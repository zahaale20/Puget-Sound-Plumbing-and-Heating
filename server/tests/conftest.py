import os

# Seed test env vars before any application module is imported
os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost:5432/testdb")
os.environ.setdefault("SUPABASE_PROJECT_ID", "testproject")
os.environ.setdefault("SUPABASE_SECRET_KEY", "test-secret-key")
os.environ.setdefault("SUPABASE_PASSWORD", "test-password")
os.environ.setdefault("SUPABASE_HOST", "localhost")
os.environ.setdefault("SUPABASE_PORT", "5432")
os.environ.setdefault("SUPABASE_DBNAME", "testdb")
os.environ.setdefault("RESEND_API_KEY", "re_test_key")
os.environ.setdefault("COMPANY_EMAIL", "test@example.com")
os.environ.setdefault("HCAPTCHA_SECRET_KEY", "0x0000000000000000000000000000000000000000")
os.environ.setdefault("ALLOW_CAPTCHA_BYPASS", "true")
os.environ.setdefault("NEWSLETTER_UNSUBSCRIBE_SECRET", "test-unsubscribe-secret")
os.environ.setdefault("CORS_ORIGINS", "")
os.environ.setdefault("TRUST_PROXY_HEADERS", "false")
os.environ.setdefault("ALLOWED_HOSTS", "testserver,localhost")

import pytest
from unittest.mock import patch, MagicMock
from contextlib import contextmanager


@pytest.fixture()
def mock_db():
    """Provide a mocked database connection for tests."""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    @contextmanager
    def _fake_get_db():
        yield mock_conn

    with patch("database.get_db_connection", _fake_get_db):
        yield mock_conn, mock_cursor


@pytest.fixture()
def client(mock_db):
    """FastAPI TestClient with mocked database."""
    from fastapi.testclient import TestClient
    from main import app
    return TestClient(app)
