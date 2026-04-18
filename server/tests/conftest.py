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

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ---------------------------------------------------------------------------
# Async DB mock helpers — psycopg3 async pool replacement
# ---------------------------------------------------------------------------
#
# Routes use the pattern:
#     async with get_db_connection() as conn:
#         async with conn.cursor() as cur:
#             await cur.execute(...)
#             row = await cur.fetchone()
#         await conn.commit()
#
# `make_async_db` returns a (factory, mock_cursor) pair that mimics this
# protocol with no real I/O. Patch `routes.<x>.get_db_connection` (or
# `services.rate_limiter.get_db_connection`) with the factory.


class _FakeUniqueViolation(Exception):
    """Minimal stand-in for psycopg's UniqueViolation with a sqlstate attribute."""

    sqlstate: str

    def __init__(self, message: str, sqlstate: str = "23505") -> None:
        super().__init__(message)
        self.sqlstate = sqlstate


def make_unique_violation(message: str = "duplicate key value violates unique constraint") -> _FakeUniqueViolation:
    """Build an exception that `is_duplicate_error` will recognize.

    Mirrors how psycopg surfaces Postgres unique violations: SQLSTATE 23505.
    Used by route tests to simulate a duplicate insert without depending on
    string matching against the exception message.
    """
    return _FakeUniqueViolation(message)


def make_async_cursor(*, fetchone=None, fetchall=None, execute_side_effect=None,
                      rowcount=1):
    """Build a mock that quacks like an async psycopg cursor."""
    cur = MagicMock()
    cur.execute = AsyncMock(side_effect=execute_side_effect)
    cur.fetchone = AsyncMock(return_value=fetchone)
    cur.fetchall = AsyncMock(return_value=fetchall if fetchall is not None else [])
    cur.rowcount = rowcount
    return cur


def make_async_db(cursor=None):
    """Build (factory, cursor). The factory replaces `get_db_connection`."""
    if cursor is None:
        cursor = make_async_cursor()

    cursor_cm = MagicMock()
    cursor_cm.__aenter__ = AsyncMock(return_value=cursor)
    cursor_cm.__aexit__ = AsyncMock(return_value=False)

    conn = MagicMock()
    conn.cursor = MagicMock(return_value=cursor_cm)
    conn.commit = AsyncMock()
    conn.rollback = AsyncMock()

    conn_cm = MagicMock()
    conn_cm.__aenter__ = AsyncMock(return_value=conn)
    conn_cm.__aexit__ = AsyncMock(return_value=False)

    def factory():
        return conn_cm

    return factory, cursor


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture()
def mock_db():
    """Patch `database.get_db_connection` with an async-capable mock.

    Yields (mock_conn_ctx_factory, mock_cursor) so individual tests can stub
    fetchone/fetchall/execute side-effects on the cursor.
    """
    cursor = make_async_cursor()
    factory, _ = make_async_db(cursor)
    with patch("database.get_db_connection", factory):
        yield factory, cursor


@pytest.fixture()
def client(mock_db):
    """FastAPI TestClient with a mocked async DB pool."""
    from fastapi.testclient import TestClient

    from main import app
    return TestClient(app)


# Allow tests that need real async behaviour to opt in via @pytest.mark.asyncio.
def pytest_collection_modifyitems(config, items) -> None:
    for item in items:
        if "asyncio" in item.keywords:
            continue
