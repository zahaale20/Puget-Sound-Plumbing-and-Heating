"""Async PostgreSQL connection pool (psycopg3).

This module replaces the previous synchronous psycopg2 pool. Every route
handler in this app is `async def`, so we need a non-blocking driver to keep
the FastAPI event loop free during DB roundtrips. See `docs/adr/0002`.

Usage in route handlers:

    from database import get_db_connection

    async with get_db_connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT ...", (arg,))
            row = await cur.fetchone()
        await conn.commit()

The `%s` placeholder syntax is unchanged from psycopg2, so existing queries
migrate verbatim.
"""

from __future__ import annotations

import asyncio
import logging
import os
from typing import Any

from dotenv import load_dotenv
from psycopg_pool import AsyncConnectionPool

load_dotenv()
logger = logging.getLogger(__name__)

_pool: AsyncConnectionPool | None = None
_pool_lock = asyncio.Lock()

# Pool sizing is configurable per-deployment. Defaults are tuned for a
# serverless deployment (Vercel) where each cold-started instance opens its
# own pool — keep `max_size` small so N concurrent instances cannot exhaust
# Supabase's connection cap. For long-lived hosts (Docker/VM) bump these via
# env. The DSN should also point at Supabase's transaction-mode pgbouncer
# (port 6543) for true horizontal scale.
_DB_POOL_MIN_CONN = int(os.getenv("DB_POOL_MIN_CONN", "1"))
_DB_POOL_MAX_CONN = int(os.getenv("DB_POOL_MAX_CONN", "5"))
_DB_STATEMENT_TIMEOUT_MS = int(os.getenv("DB_STATEMENT_TIMEOUT_MS", "10000"))


def _build_dsn() -> str:
    dsn = os.getenv("DATABASE_URL")
    if dsn:
        return dsn

    project_id = os.getenv("SUPABASE_PROJECT_ID") or ""
    user = f"postgres.{project_id}" if project_id else "postgres"
    password = os.getenv("SUPABASE_PASSWORD", "")
    host = os.getenv("SUPABASE_HOST", "localhost")
    port = os.getenv("SUPABASE_PORT", "5432")
    dbname = os.getenv("SUPABASE_DBNAME", "postgres")
    return f"postgresql://{user}:{password}@{host}:{port}/{dbname}"


def _connection_kwargs() -> dict:
    # `options` is a libpq parameter that lets us set a server-side
    # statement_timeout for *every* connection in the pool — defence-in-depth
    # against runaway queries. Driven by env so ops can tune without a deploy.
    return {"options": f"-c statement_timeout={_DB_STATEMENT_TIMEOUT_MS}"}


async def _ensure_pool() -> AsyncConnectionPool:
    global _pool
    async with _pool_lock:
        if _pool is None:
            _pool = AsyncConnectionPool(
                conninfo=_build_dsn(),
                min_size=_DB_POOL_MIN_CONN,
                max_size=_DB_POOL_MAX_CONN,
                kwargs=_connection_kwargs(),
                open=False,  # opened explicitly so we can await it
            )
            await _pool.open()
    return _pool


def get_db_connection() -> Any:
    """Async context manager yielding a pooled connection.

    Returns the underlying psycopg connection, NOT a wrapped object — call
    sites use `async with conn.cursor()` / `await conn.commit()` directly.
    """

    class _ConnCtx:
        async def __aenter__(self) -> Any:
            pool = await _ensure_pool()
            self._cm = pool.connection()
            return await self._cm.__aenter__()

        async def __aexit__(self, exc_type: Any, exc: Any, tb: Any) -> Any:
            return await self._cm.__aexit__(exc_type, exc, tb)

    return _ConnCtx()


async def close_pool() -> None:
    """Close the pool. Call on app shutdown."""
    global _pool
    pool = _pool
    _pool = None
    if pool is None:
        return

    try:
        await pool.close()
    except asyncio.CancelledError:
        logger.warning("Database pool close was cancelled; cleared cached pool reference")
    except Exception:
        logger.exception("Database pool close failed; cleared cached pool reference")


async def test_db() -> bool:
    """Return True if a basic SELECT round-trip succeeds."""
    try:
        async with get_db_connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT 1")
                row = await cur.fetchone()
                return bool(row and row[0] == 1)
    except Exception as e:
        logger.exception("Database connectivity test failed: %s", str(e))
        return False