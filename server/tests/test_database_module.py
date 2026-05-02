import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

import database
from tests.conftest import make_async_cursor, make_async_db


class TestBuildDsn:
    def test_uses_database_url_when_present(self, monkeypatch) -> None:
        monkeypatch.setenv("DATABASE_URL", "postgresql://u:p@h:5432/db")
        assert database._build_dsn() == "postgresql://u:p@h:5432/db"

    def test_builds_from_supabase_env(self, monkeypatch) -> None:
        monkeypatch.delenv("DATABASE_URL", raising=False)
        monkeypatch.setenv("SUPABASE_PROJECT_ID", "abc")
        monkeypatch.setenv("SUPABASE_PASSWORD", "pw")
        monkeypatch.setenv("SUPABASE_HOST", "db.local")
        monkeypatch.setenv("SUPABASE_PORT", "5433")
        monkeypatch.setenv("SUPABASE_DBNAME", "mydb")
        assert database._build_dsn() == "postgresql://postgres.abc:pw@db.local:5433/mydb"


class TestConnectionKwargs:
    def test_statement_timeout_is_included(self, monkeypatch) -> None:
        monkeypatch.setattr(database, "_DB_STATEMENT_TIMEOUT_MS", 4321)
        assert database._connection_kwargs() == {"options": "-c statement_timeout=4321"}


class TestPoolLifecycle:
    @pytest.mark.asyncio
    async def test_ensure_pool_initializes_once(self) -> None:
        database._pool = None

        dummy_pool = MagicMock()
        dummy_pool.open = AsyncMock()

        with patch("database.AsyncConnectionPool", return_value=dummy_pool) as mock_pool:
            first = await database._ensure_pool()
            second = await database._ensure_pool()

        assert first is dummy_pool
        assert second is dummy_pool
        mock_pool.assert_called_once()
        dummy_pool.open.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_get_db_connection_context_manager(self) -> None:
        cm = MagicMock()
        cm.__aenter__ = AsyncMock(return_value="CONN")
        cm.__aexit__ = AsyncMock(return_value=False)

        pool = MagicMock()
        pool.connection.return_value = cm

        with patch("database._ensure_pool", new=AsyncMock(return_value=pool)):
            async with database.get_db_connection() as conn:
                assert conn == "CONN"

        cm.__aexit__.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_close_pool_when_none(self) -> None:
        database._pool = None
        await database.close_pool()
        assert database._pool is None

    @pytest.mark.asyncio
    async def test_close_pool_success(self) -> None:
        pool = MagicMock()
        pool.close = AsyncMock()
        database._pool = pool

        await database.close_pool()

        pool.close.assert_awaited_once()
        assert database._pool is None

    @pytest.mark.asyncio
    async def test_close_pool_cancelled_error_is_handled(self) -> None:
        pool = MagicMock()
        pool.close = AsyncMock(side_effect=asyncio.CancelledError())
        database._pool = pool

        await database.close_pool()

        assert database._pool is None


class TestDbHealthCheck:
    @pytest.mark.asyncio
    async def test_test_db_success(self) -> None:
        cur = make_async_cursor(fetchone=(1,))
        factory, _ = make_async_db(cur)
        with patch("database.get_db_connection", factory):
            assert await database.test_db() is True

    @pytest.mark.asyncio
    async def test_test_db_false_on_non_1(self) -> None:
        cur = make_async_cursor(fetchone=(0,))
        factory, _ = make_async_db(cur)
        with patch("database.get_db_connection", factory):
            assert await database.test_db() is False

    @pytest.mark.asyncio
    async def test_test_db_false_on_exception(self) -> None:
        with patch("database.get_db_connection", side_effect=Exception("down")):
            assert await database.test_db() is False
