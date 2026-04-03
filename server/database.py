import os
import psycopg2
import logging
from contextlib import contextmanager
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

@contextmanager
def get_db_connection():
    conn = psycopg2.connect(
        user=os.getenv("SUPABASE_USER"),
        password=os.getenv("SUPABASE_PASSWORD"),
        host=os.getenv("SUPABASE_HOST"),
        port=os.getenv("SUPABASE_PORT"),
        dbname=os.getenv("SUPABASE_DBNAME")
    )
    try:
        yield conn
    finally:
        conn.close()

def test_db():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT NOW();")
                return cur.fetchone()[0]
    except Exception as e:
        logger.exception("Database connectivity test failed: %s", str(e))
        return "Database connection error"