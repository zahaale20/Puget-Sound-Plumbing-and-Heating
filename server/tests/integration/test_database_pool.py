"""Real-Postgres tests for `database.py`.

The unit suite never executes a real query — every route test patches
`routes.X.get_db_connection` with an in-memory mock. That leaves
`database.py` at ~33% line coverage and, more importantly, leaves the
behaviours that *only emerge from a real driver* completely untested:

- pool open/close lifecycle
- the libpq `statement_timeout` `options` we pass per connection
- `is_duplicate_error` recognising a real `psycopg.errors.UniqueViolation`
- concurrent connections actually multiplexing on the pool
- `test_db()` returning True against a live DB

Each of these has bitten the codebase before (or would have, silently).
"""

from __future__ import annotations

import asyncio

import pytest
from psycopg import errors as psycopg_errors

from utils import is_duplicate_error


pytestmark = [pytest.mark.asyncio, pytest.mark.integration]


async def test_test_db_round_trips(db) -> None:
    assert await db.test_db() is True


async def test_pool_serves_concurrent_connections(db):
    """The pool should hand out >1 connection at a time without serialising."""

    async def _ping(i: int) -> int:
        async with db.get_db_connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT %s", (i,))
                row = await cur.fetchone()
                return row[0]

    results = await asyncio.gather(*[_ping(i) for i in range(8)])
    assert results == list(range(8))


async def test_statement_timeout_is_applied(db) -> None:
    """`_connection_kwargs` injects `statement_timeout`. Verify it's set
    server-side on every pooled connection — not just configured client-side.
    """
    async with db.get_db_connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SHOW statement_timeout")
            value = (await cur.fetchone())[0]
    # Postgres reports e.g. '10s'. We just assert it's non-zero.
    assert value not in ("0", "0ms")


async def test_unique_violation_is_recognised_by_is_duplicate_error(db) -> None:
    """`is_duplicate_error` must match the *real* psycopg exception type.

    Unit tests synthesise a duplicate via `make_unique_violation()` (a
    plain Exception with `sqlstate = "23505"`). Without this test, a
    psycopg upgrade that changed the exception class hierarchy would
    silently break duplicate handling on every form route, and the unit
    suite would still be green.
    """
    async with db.get_db_connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                'INSERT INTO "Newsletter" (email) VALUES (%s)',
                ("dup@example.com",),
            )
        await conn.commit()

        raised: Exception | None = None
        try:
            async with conn.cursor() as cur:
                await cur.execute(
                    'INSERT INTO "Newsletter" (email) VALUES (%s)',
                    ("dup@example.com",),
                )
        except Exception as exc:  # noqa: BLE001 — exactly what we're testing
            raised = exc
            await conn.rollback()

    assert raised is not None
    assert isinstance(raised, psycopg_errors.UniqueViolation)
    assert is_duplicate_error(raised) is True


async def test_close_pool_then_reopen(db) -> None:
    """`close_pool` must drop the global so a subsequent call rebuilds it."""
    await db.test_db()  # ensure pool exists
    assert db._pool is not None

    await db.close_pool()
    assert db._pool is None

    # Next call rebuilds the pool transparently.
    assert await db.test_db() is True
    assert db._pool is not None
