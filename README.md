
# Puget Sound Plumbing and Heating Website

This monorepo contains the full-stack web application for Puget Sound Plumbing and Heating, including:

- **Frontend:** Vite + React + Tailwind CSS
- **Backend:** FastAPI (async Python) + PostgreSQL + Alembic
- **Testing:** Vitest, Playwright (frontend); pytest, pytest-asyncio, pytest-cov (backend)

---

## 🗂️ Project Structure

- `client/` — Frontend app (Vite, React, Tailwind, Playwright, E2E tests)
	- `src/` — React components, pages, hooks, services, and data
	- `e2e/` — Playwright end-to-end tests
	- `public/` — Static assets, robots.txt, sitemap.xml
	- `scripts/` — SEO, prerender, and bundle analysis scripts
- `server/` — Backend API (FastAPI, async Postgres, Alembic, pytest)
	- `alembic/` — Database migrations (see below)
	- `routes/` — API endpoints (e.g. `/api/redeem-offer`)
	- `models/` — Pydantic models and DB schemas
	- `services/` — Email, captcha, rate limiting, storage, etc.
	- `tests/` — Unit and integration tests
- `documentation/` — Architecture diagrams, design docs

---

## 🚀 Stack & Dependencies

**Frontend:**
- React 19, Vite, Tailwind CSS
- Playwright (E2E), Vitest (unit), ESLint, Prettier
- SEO: prerender, sitemap, audit scripts

**Backend:**
- FastAPI, async/await, Starlette
- PostgreSQL (async, via psycopg3)
- Alembic (migrations)
- Email: Resend API
- Captcha: hCaptcha
- Rate limiting: custom, per-form
- Observability: Prometheus, Sentry (optional)
- Testing: pytest, pytest-asyncio, pytest-cov

---

## 🏗️ Setup & Local Development

### Prerequisites
- Node.js (18+ recommended)
- Python 3.11+
- PostgreSQL (local or cloud)

### 1. Clone the repo
```sh
# Puget Sound Plumbing and Heating Website

This monorepo contains the full-stack web application for Puget Sound Plumbing and Heating.

## Structure

- [`client/`](client/README.md): Frontend (Vite, React, Tailwind, Playwright, SEO, hCaptcha, etc.)
- [`server/`](server/README.md): Backend (FastAPI, async Postgres, Alembic, email, rate limiting, etc.)
- `documentation/`: Architecture diagrams and design docs

See the [client README](client/README.md) and [server README](server/README.md) for full details on each part.

## Quick Start

1. Clone the repo and `cd` into `pspah-website`
2. See `client/README.md` and `server/README.md` for setup, scripts, and environment details
3. Run both frontend and backend locally for full-stack development

## Deployment

- **Frontend:** Deploys to Vercel (see `client/vercel.json`)
- **Backend:** Deploys to Vercel or any Python host (see `server/vercel.json` and `server/Dockerfile`)
- **Migrations:** Always run `alembic upgrade head` after backend deploys with new migrations

## Documentation & Support

- Architecture: `documentation/architecture/`
- For help, open an issue or email info@pugetsoundplumbing.com

**© 2026 Puget Sound Plumbing and Heating**
cd client
