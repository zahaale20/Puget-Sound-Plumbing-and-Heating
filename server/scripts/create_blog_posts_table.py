import os
from pathlib import Path

import psycopg2
from dotenv import load_dotenv

SCHEMA_FILE = Path(__file__).resolve().parents[1] / "sql" / "create_blog_posts_table.sql"


def _load_env() -> None:
    server_env = Path(__file__).resolve().parents[1] / ".env"
    if server_env.exists():
        load_dotenv(server_env)
    else:
        load_dotenv()


def _connect():
    return psycopg2.connect(
        user=os.getenv("SUPABASE_USER"),
        password=os.getenv("SUPABASE_PASSWORD"),
        host=os.getenv("SUPABASE_HOST"),
        port=os.getenv("SUPABASE_PORT"),
        dbname=os.getenv("SUPABASE_DBNAME"),
    )


def create_blog_posts_table() -> None:
    _load_env()

    sql = SCHEMA_FILE.read_text(encoding="utf-8")

    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
        conn.commit()

    print('"Blog Posts" table is ready in Supabase.')


if __name__ == "__main__":
    create_blog_posts_table()
