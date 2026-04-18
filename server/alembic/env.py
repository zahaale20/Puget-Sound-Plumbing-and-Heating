"""Alembic environment.

This project uses raw SQL (no ORM models), so we configure Alembic for
"offline-friendly" migrations that operate purely via `op.execute(...)` in
the version files. We resolve the DSN at runtime from the same env vars the
application uses, so `alembic upgrade head` works in CI, prod, and local.
"""
from __future__ import annotations

import os
from logging.config import fileConfig

from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool

from alembic import context

load_dotenv()

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)


def _build_dsn() -> str:
    dsn = os.getenv("DATABASE_URL")
    if dsn:
        # SQLAlchemy needs the +psycopg dialect for psycopg3.
        if dsn.startswith("postgresql://") and "+" not in dsn.split("://", 1)[0]:
            dsn = dsn.replace("postgresql://", "postgresql+psycopg://", 1)
        return dsn

    project_id = os.getenv("SUPABASE_PROJECT_ID") or ""
    user = f"postgres.{project_id}" if project_id else "postgres"
    password = os.getenv("SUPABASE_PASSWORD", "")
    host = os.getenv("SUPABASE_HOST", "localhost")
    port = os.getenv("SUPABASE_PORT", "5432")
    dbname = os.getenv("SUPABASE_DBNAME", "postgres")
    return f"postgresql+psycopg://{user}:{password}@{host}:{port}/{dbname}"


def run_migrations_offline() -> None:
    context.configure(
        url=_build_dsn(),
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    cfg = config.get_section(config.config_ini_section) or {}
    cfg["sqlalchemy.url"] = _build_dsn()
    connectable = engine_from_config(cfg, prefix="sqlalchemy.", poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
