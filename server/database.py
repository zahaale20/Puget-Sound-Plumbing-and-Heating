import os
import psycopg2
import psycopg2.pool
import logging
from contextlib import contextmanager
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

_pool = None


def _get_pool():
    global _pool
    if _pool is None:
        _pool = psycopg2.pool.SimpleConnectionPool(
            minconn=1,
            maxconn=5,
            user=os.getenv("SUPABASE_USER"),
            password=os.getenv("SUPABASE_PASSWORD"),
            host=os.getenv("SUPABASE_HOST"),
            port=os.getenv("SUPABASE_PORT"),
            dbname=os.getenv("SUPABASE_DBNAME"),
            options="-c statement_timeout=10000",
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