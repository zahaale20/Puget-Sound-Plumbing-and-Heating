import os
import psycopg2
import psycopg2.pool
import logging
from contextlib import contextmanager
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

_pool = None


# Pool sizing is configurable so we can tune per-deployment without a code
# change. Defaults are chosen for a small production deployment behind a
# pooled Postgres (e.g. Supabase pgbouncer). Bump DB_POOL_MAX_CONN for
# higher-concurrency hosts.
_DB_POOL_MIN_CONN = int(os.getenv("DB_POOL_MIN_CONN", "2"))
_DB_POOL_MAX_CONN = int(os.getenv("DB_POOL_MAX_CONN", "20"))
_DB_STATEMENT_TIMEOUT_MS = int(os.getenv("DB_STATEMENT_TIMEOUT_MS", "10000"))


def _get_pool():
    global _pool
    if _pool is None:
        options = f"-c statement_timeout={_DB_STATEMENT_TIMEOUT_MS}"
        dsn = os.getenv("DATABASE_URL")
        if dsn:
            _pool = psycopg2.pool.ThreadedConnectionPool(
                minconn=_DB_POOL_MIN_CONN,
                maxconn=_DB_POOL_MAX_CONN,
                dsn=dsn,
                options=options,
            )
        else:
            project_id = os.getenv("SUPABASE_PROJECT_ID")
            _pool = psycopg2.pool.ThreadedConnectionPool(
                minconn=_DB_POOL_MIN_CONN,
                maxconn=_DB_POOL_MAX_CONN,
                user=f"postgres.{project_id}" if project_id else None,
                password=os.getenv("SUPABASE_PASSWORD"),
                host=os.getenv("SUPABASE_HOST"),
                port=os.getenv("SUPABASE_PORT"),
                dbname=os.getenv("SUPABASE_DBNAME"),
                options=options,
            )
    return _pool


@contextmanager
def get_db_connection():
    pool = _get_pool()
    conn = pool.getconn()
    try:
        yield conn
    finally:
        pool.putconn(conn)


def test_db():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT NOW();")
                return cur.fetchone()[0]
    except Exception as e:
        logger.exception("Database connectivity test failed: %s", str(e))
        return "Database connection error"