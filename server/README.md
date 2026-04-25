# PSPAH Website Backend (server)

This is the backend for the Puget Sound Plumbing and Heating website, built with FastAPI and PostgreSQL.

## Features
- FastAPI async REST API
- PostgreSQL (async, via psycopg3)
- Alembic for schema migrations
- Email via Resend API
- hCaptcha verification
- Per-form rate limiting
- Observability: Prometheus metrics, Sentry (optional)
- Unit and integration tests (pytest, pytest-asyncio, pytest-cov)
- Dockerfile for containerized deployment

## Directory Structure
- `main.py` — FastAPI app entrypoint
- `alembic/` — Database migrations
- `routes/` — API endpoints (blog, offers, schedule, etc.)
- `models/` — Pydantic models and DB schemas
- `services/` — Email, captcha, rate limiting, storage, etc.
- `tests/` — Unit and integration tests

## Setup
1. Create and activate a Python 3.12+ virtual environment
2. `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and fill in secrets (DB URL, API keys, etc)
4. Start Postgres and run `alembic upgrade head` to apply migrations
5. `uvicorn main:app --reload` to start the server

## Testing
- `pytest` — Run all tests
- `pytest --cov` — Run with coverage
- `pytest tests/integration/` — Run integration tests

## Deployment
- Can be deployed to Vercel (see `vercel.json`) or any Python host
- Use the provided Dockerfile for containerized deployments
- Always run `alembic upgrade head` after deploying migrations

## Contributing
- Use Ruff and Black for code style
- Add/maintain tests for all routes and services
- PRs and issues welcome
