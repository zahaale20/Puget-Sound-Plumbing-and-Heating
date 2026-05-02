# Puget Sound Plumbing and Heating Website

Full-stack monorepo for the Puget Sound Plumbing and Heating website.

- Frontend: Vite, React 19, Tailwind CSS, Vitest, Playwright.
- Backend: FastAPI, Python 3.12+, PostgreSQL, Alembic, pytest.
- Deployment: Vercel-oriented frontend and Python backend configuration, with Docker support for backend smoke tests.

## Project structure

- [client/](client/) — React frontend application.
- [client/src/](client/src/) — Frontend components, pages, hooks, data, and services.
- [client/e2e/](client/e2e/) — Playwright end-to-end tests.
- [server/](server/) — FastAPI backend application.
- [server/alembic/](server/alembic/) — Database migrations.
- [server/routes/](server/routes/) — API route handlers.
- [server/services/](server/services/) — Email, captcha, storage, rate limiting, and resilience services.
- [server/tests/](server/tests/) — Backend unit and integration tests.
- [documentation/](documentation/) — Architecture documentation and diagrams.

## Prerequisites

- Node.js 20.19+ or 22.12+.
- Python 3.12+.
- Docker Desktop or another Docker Compose-compatible runtime for local PostgreSQL.

## Local setup

Run these commands from the repository root unless a step says otherwise.

### 1. Start PostgreSQL

```sh
docker compose -f docker-compose.full-stack-smoke.yml up -d db
```

This starts a local PostgreSQL 16 container on port 5432 with database `pspah`, user `postgres`, and password `postgres`.

### 2. Start the backend

```sh
cd server
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"

export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/pspah"
export ENABLE_HTTPS_REDIRECT="false"
export ALLOW_CAPTCHA_BYPASS="true"
export EMAIL_DRY_RUN="true"
export RESEND_API_KEY="re_local_key"
export COMPANY_EMAIL="local@example.com"
export SUPABASE_PROJECT_ID="localproject"
export NEWSLETTER_UNSUBSCRIBE_SECRET="local-unsubscribe-secret"

alembic upgrade head
uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

The API is available at `http://127.0.0.1:8001`. Keep this terminal running.

### 3. Start the frontend

Open a second terminal, then run:

```sh
cd client
npm ci
npm run dev
```

The frontend is available at the Vite URL printed in the terminal, usually `http://localhost:5173`. The Vite dev server proxies `/api` requests to the backend on port 8001.

## Tests and checks

### Frontend

```sh
cd client
npm test
npm run lint
npm run build
```

### Backend

```sh
cd server
source .venv/bin/activate
pytest
ruff check .
```

### Full-stack smoke test

```sh
cd client
npm run test:e2e:full-stack
```

The smoke test starts the disposable Docker Compose stack in [docker-compose.full-stack-smoke.yml](docker-compose.full-stack-smoke.yml), runs backend migrations, serves the frontend with `VITE_API_BASE_URL=http://127.0.0.1:8000`, and verifies a real backend/database form flow.

## Deployment notes

- Frontend deployment configuration lives in [client/vercel.json](client/vercel.json).
- Backend deployment configuration lives in [server/vercel.json](server/vercel.json) and [server/Dockerfile](server/Dockerfile).
- Production CD runs `alembic upgrade head` before deploying application code and blocks the Vercel deploy unless the database verifies at Alembic head.
- Configure the CD workflow with a direct, migration-capable production database secret named `PRODUCTION_DATABASE_URL`; `DATABASE_URL` is accepted as a fallback for existing repositories.
- If a manual release is ever required, run `alembic upgrade head` against production first, then verify `alembic current` shows the latest head before deploying client or server code.
- Do not commit populated `.env` files or real API keys.

### Manual release checklist

Use this only when the automated CD workflow is unavailable.

1. Confirm CI is green for the commit being released.
2. Apply migrations against the production database from [server/](server/) with `alembic upgrade head`.
3. Block the release until `alembic current` reports the same revision as `alembic heads`.
4. Deploy the server and client Vercel projects from the same commit.
5. Smoke test one database-backed form flow, such as coupon redemption, before announcing the release.

## More details

- [client/README.md](client/README.md) documents frontend scripts and behavior.
- [server/README.md](server/README.md) documents backend features, environment variables, and deployment notes.
