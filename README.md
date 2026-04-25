
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
git clone https://github.com/zahaale20/Puget-Sound-Plumbing-and-Heating.git
cd Puget-Sound-Plumbing-and-Heating/pspah-website
```

### 2. Install dependencies
```sh
# Frontend
cd client && npm install
# Backend
cd ../server && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt
```

### 3. Configure environment
- Copy `.env.example` to `.env` in both `client/` and `server/` and fill in secrets (DB URL, API keys, etc).

### 4. Set up the database
```sh
# Start Postgres and create the DB if needed
# Run migrations:
cd server && alembic upgrade head
```

### 5. Run the backend
```sh
cd server && source venv/bin/activate
uvicorn main:app --reload
```

### 6. Run the frontend
```sh
cd client
npm run dev
```

---

## 🧪 Testing

### Frontend
- `npm test` — Run unit tests (Vitest)
- `npm run test:e2e` — Run Playwright E2E tests
- `npm run lint` / `npm run format` — Lint and auto-format code

### Backend
- `pytest` — Run all backend tests
- `pytest --cov` — Run with coverage
- `pytest tests/test_offers_routes.py` — Test coupon redemption logic

---


## 🛡️ Coupon Deduplication

- The `/api/redeem-offer` endpoint prevents duplicate coupon emails using a unique constraint on `(email, phone, coupon_discount, coupon_condition)`.
- If the database migration for this constraint is missing, the route still ensures only one coupon is sent per unique tuple using a transactional fallback.
- See `server/routes/offers.py` for implementation details.

---

## 🏢 Deployment

- **Frontend:** Deploys to Vercel (see `vercel.json`).
- **Backend:** Can run on any serverless or managed Python host with Postgres access. Vercel serverless supported.
- **Migrations:** Always run `alembic upgrade head` after deploying backend changes that include new migrations.

---

## 🤝 Contributing

1. Fork and clone the repo
2. Create a feature branch
3. Make your changes and add tests
4. Run all tests and linters
5. Open a pull request with a clear description

### Coding Conventions
- Use Prettier and ESLint for JS/TS/React code
- Use Ruff and Black for Python code (if configured)
- Write tests for all new features and bugfixes

---

## 📚 Documentation & Support

- Architecture diagrams: `documentation/architecture/`
- For questions or support, open an issue or email info@pugetsoundplumbing.com

---

**© 2026 Puget Sound Plumbing and Heating**
