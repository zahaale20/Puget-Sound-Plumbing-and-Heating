"""Integration-test fixtures for the real Postgres in `docker-compose.yml`.

These tests exist because the unit suite mocks `routes.<x>.get_db_connection`
and `routes.<x>.verify_captcha` — verifying orchestration but never the
SQL itself, the unique-constraint behaviour, the `ON CONFLICT` clauses,
or the real psycopg pool. Every test in this directory talks to a real
Postgres instance and exercises `database.py`, `services/rate_limiter.py`,
and the route handlers' SQL end-to-end.

How it skips cleanly
--------------------
If no Postgres is reachable at the configured DSN the entire integration
package is skipped at collection time with a clear reason, so local unit
runs (`pytest tests/test_*.py`) are unaffected. To enable:

    docker compose up -d db
    cd pspah-website/server && venv/bin/pytest tests/integration

The DSN is taken from `INTEGRATION_DATABASE_URL` if set, otherwise it
defaults to the docker-compose value. Pointing at a *separate* test DB is
strongly recommended — these tests TRUNCATE every form table between
cases and will happily wipe a real dataset if you point them at one.
"""

from __future__ import annotations

import asyncio
import importlib
import os
import socket
from contextlib import closing
from urllib.parse import urlparse

import pytest

DEFAULT_INTEGRATION_DSN = "postgresql://postgres:postgres@localhost:5432/pspah"

pytestmark = pytest.mark.integration

INTEGRATION_DSN = os.getenv("INTEGRATION_DATABASE_URL", DEFAULT_INTEGRATION_DSN)

# Tables managed by alembic that integration tests touch. We TRUNCATE these
# (rather than relying on transactional rollback) because route handlers
# call `await conn.commit()` themselves and BackgroundTasks may run after
# the request completes.
_FORM_TABLES = (
    '"Schedule Online"',
    '"Newsletter"',
    '"Redeemed Offers"',
    '"DIY Permit Requests"',
    '"Job Applications"',
    '"Blog Posts"',
    "rate_limits",
)


def _tcp_reachable(dsn: str, timeout_sec: float = 1.0) -> bool:
    parsed = urlparse(dsn)
    host = parsed.hostname or "localhost"
    port = parsed.port or 5432
    try:
        with closing(socket.create_connection((host, port), timeout=timeout_sec)):
            return True
    except OSError:
        return False


# Hard skip the whole integration package when Postgres is not running.
# This runs once at import time so collection itself is fast.
if not _tcp_reachable(INTEGRATION_DSN):
    pytest.skip(
        f"Integration Postgres unreachable at {INTEGRATION_DSN}. "
        "Run `docker compose up -d db` (or set INTEGRATION_DATABASE_URL) "
        "to enable these tests.",
        allow_module_level=True,
    )


def _run_migrations(dsn: str) -> None:
    """Apply alembic migrations to the integration DB.

    Done synchronously with sqlalchemy because that's what `alembic/env.py`
    drives. Migrations are idempotent (`IF NOT EXISTS` everywhere) so this
    is safe to re-run on every test session.
    """
    from alembic import command
    from alembic.config import Config

    server_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    cfg = Config(os.path.join(server_dir, "alembic.ini"))
    cfg.set_main_option("script_location", os.path.join(server_dir, "alembic"))

    # `alembic/env.py` reads DATABASE_URL itself; set it for the duration
    # of the upgrade.
    prev = os.environ.get("DATABASE_URL")
    os.environ["DATABASE_URL"] = dsn
    try:
        command.upgrade(cfg, "head")
    finally:
        if prev is None:
            os.environ.pop("DATABASE_URL", None)
        else:
            os.environ["DATABASE_URL"] = prev


@pytest.fixture(scope="session")
def integration_dsn() -> str:
    return INTEGRATION_DSN


@pytest.fixture(scope="session", autouse=True)
def _migrate_once(integration_dsn):
    """Apply alembic migrations once per session against the integration DB."""
    _run_migrations(integration_dsn)
    yield


@pytest.fixture(scope="session")
def _real_db_module(integration_dsn):
    """Reload `database` with the integration DSN bound and a fresh pool.

    The unit-test conftest seeds `DATABASE_URL` to a fake DSN and the
    `database` module module-level imports may have already cached env
    values — so we explicitly point the env at the integration DSN and
    reset the cached `_pool` global before any integration test runs.
    """
    os.environ["DATABASE_URL"] = integration_dsn
    import database  # noqa: WPS433 — runtime import is intentional

    importlib.reload(database)
    yield database

    # Tear the pool down at session end so subsequent unit suites in the
    # same process don't reuse a connection bound to the test DB.
    asyncio.run(database.close_pool())


@pytest.fixture()
def db(_real_db_module):
    """Per-test handle to the real `database` module."""
    return _real_db_module


@pytest.fixture(autouse=True)
async def _truncate_between_tests(_real_db_module):
    """Wipe form/rate-limit tables before each test for isolation.

    The async DB pool is loop-bound. Pytest-asyncio runs tests on a function-
    scoped event loop by default, so reusing the same pool across tests can
    bind it to a closed loop and fail only in the full suite. Reset the pool
    around every integration test so each test creates its own pool on its
    active loop.
    """
    await _real_db_module.close_pool()
    async with _real_db_module.get_db_connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                f"TRUNCATE {', '.join(_FORM_TABLES)} RESTART IDENTITY CASCADE"
            )
        await conn.commit()
    yield
    await _real_db_module.close_pool()


@pytest.fixture()
def integration_app(_real_db_module, monkeypatch):
    """Build the FastAPI app wired to the real DB.

    We mock only the *external* I/O the app does not own: Resend (email)
    and hCaptcha. The real hCaptcha integration is covered separately in
    `test_captcha_service_http.py`; route tests patch route-level
    `verify_captcha` to keep the focus on SQL and persistence behaviour.
    Email send functions are replaced with `AsyncMock` at the route module
    level — that is the legitimate boundary to mock (a third-party API),
    unlike `routes.X.get_db_connection` which is the *system under test*.
    """
    from unittest.mock import AsyncMock

    monkeypatch.setenv("ALLOW_CAPTCHA_BYPASS", "true")
    monkeypatch.setenv("HCAPTCHA_SECRET_KEY", "")

    # Patch every email send symbol that route handlers import. Patching at
    # the route-module attribute (where it was imported into) is correct
    # because the routes did `from services.email_service import send_x`.
    from routes import careers, diy_permit, newsletter, offers, schedule

    email_mocks = {}
    for module in (schedule, newsletter, offers, diy_permit, careers):
        monkeypatch.setattr(module, "verify_captcha", AsyncMock(return_value=True))

    for module, names in (
        (schedule, ("send_followup", "send_schedule_notification")),
        (newsletter, (
            "send_newsletter_confirmation",
            "send_newsletter_notification",
            "send_newsletter_unsubscribe_confirmation",
            "send_newsletter_unsubscribe_notification",
        )),
        (offers, ("send_coupon_confirmation", "send_coupon_notification")),
        (diy_permit, ("send_diy_permit_confirmation", "send_diy_permit_notification")),
        (careers, (
            "send_job_application_confirmation",
            "send_job_application_notification",
        )),
    ):
        for name in names:
            mock = AsyncMock()
            monkeypatch.setattr(module, name, mock)
            email_mocks[f"{module.__name__}.{name}"] = mock

    from fastapi.testclient import TestClient

    from main import app

    client = TestClient(app)
    client.email_mocks = email_mocks
    return client
