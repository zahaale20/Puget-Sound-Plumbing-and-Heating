import sys
import os
from unittest.mock import patch, MagicMock
from contextlib import contextmanager

import pytest
from fastapi.testclient import TestClient

# Ensure server root is on sys.path so imports resolve
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


# ---------------------------------------------------------------------------
# Environment – set before any application module is imported
# ---------------------------------------------------------------------------
os.environ.setdefault("CLOUDFRONT_URL", "https://test.cloudfront.net")
os.environ.setdefault("AWS_ACCESS_KEY_ID", "test-key")
os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "test-secret")
os.environ.setdefault("AWS_REGION", "us-west-2")
os.environ.setdefault("S3_MEDIA_BUCKET_NAME", "test-bucket")
os.environ.setdefault("S3_RESUMES_BUCKET", "test-resumes-bucket")
os.environ.setdefault("RESEND_API_KEY", "re_test_key")
os.environ.setdefault("RESEND_FROM_EMAIL", "test@test.com")
os.environ.setdefault("SUPABASE_USER", "test")
os.environ.setdefault("SUPABASE_PASSWORD", "test")
os.environ.setdefault("SUPABASE_HOST", "localhost")
os.environ.setdefault("SUPABASE_PORT", "5432")
os.environ.setdefault("SUPABASE_DBNAME", "test_db")


# ---------------------------------------------------------------------------
# Fake DB connection used across tests
# ---------------------------------------------------------------------------
@contextmanager
def _fake_db_connection():
    conn = MagicMock()
    cursor = MagicMock()
    cursor.rowcount = 1
    conn.cursor.return_value.__enter__ = lambda self: cursor
    conn.cursor.return_value.__exit__ = MagicMock(return_value=False)
    yield conn


@pytest.fixture(autouse=True)
def mock_db(monkeypatch):
    """Patch get_db_connection everywhere so no real DB is needed."""
    import database
    monkeypatch.setattr(database, "get_db_connection", _fake_db_connection)
    # Also patch the import used inside routes.email
    import routes.email as email_mod
    monkeypatch.setattr(email_mod, "get_db_connection", _fake_db_connection)


@pytest.fixture(autouse=True)
def mock_resend(monkeypatch):
    """Prevent real emails from being sent."""
    import resend
    mock_send = MagicMock(return_value={"id": "test-email-id"})
    monkeypatch.setattr(resend.Emails, "send", mock_send)
    return mock_send


@pytest.fixture(autouse=True)
def mock_s3(monkeypatch):
    """Prevent real S3 calls in route-level tests."""
    import routes.email as email_mod
    email_mod.s3_service.s3_client = MagicMock()
    email_mod.s3_service.resumes_bucket = "test-bucket"


@pytest.fixture(autouse=True)
def disable_recaptcha(monkeypatch):
    """Disable reCAPTCHA verification by default (no secret key configured)."""
    import routes.email as email_mod
    monkeypatch.setattr(email_mod, "RECAPTCHA_SECRET_KEY", None)


@pytest.fixture()
def enable_recaptcha(monkeypatch):
    """Fixture to re-enable reCAPTCHA for specific tests."""
    import routes.email as email_mod
    monkeypatch.setattr(email_mod, "RECAPTCHA_SECRET_KEY", "test-secret-key")


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    """Clear rate limiter state between tests."""
    from services.rate_limiter import _request_tracker
    _request_tracker.clear()
    yield
    _request_tracker.clear()


@pytest.fixture()
def client():
    """FastAPI TestClient with all mocks active."""
    from main import app
    return TestClient(app)
