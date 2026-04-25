# Puget Sound Plumbing and Heating Website

This is the monorepo for the Puget Sound Plumbing and Heating website, including both the frontend (Vite/React) and backend (FastAPI/Postgres) codebases.

## Project Structure

- `client/` — Frontend (Vite, React, Playwright, E2E tests)
- `server/` — Backend (FastAPI, async Postgres, Alembic, pytest)
- `server/alembic/` — Database migrations
- `server/routes/` — API endpoints (including `/api/redeem-offer`)
- `server/tests/` — Backend unit and integration tests
- `client/src/` — Frontend source code

## Key Features

- **Coupon Redemption**: `/api/redeem-offer` endpoint with deduplication and fallback logic for safe operation even if DB migrations are not up-to-date.
- **Rate Limiting**: Per-form rate limits to prevent abuse.
- **Email Notifications**: Sends confirmation to customers and notifications to company staff.
- **CI/CD Ready**: Designed for Vercel (frontend) and serverless/managed Postgres (backend).
- **Testing**: Extensive unit and integration tests for both frontend and backend.

## Recent Fixes

- **2026-04**: Fixed production 500 errors on `/api/redeem-offer` by adding a fallback path when the deduplication constraint is missing (see `server/routes/offers.py`).

## How to Run Locally

1. Clone the repo
2. Install dependencies for both frontend and backend
3. Set up a local Postgres instance and run Alembic migrations
4. Start the backend and frontend servers

See `server/README.md` and `client/README.md` for more details (if present).

## Contributing

Pull requests and issues are welcome. Please ensure all tests pass before submitting changes.

---

**Contact:** info@pugetsoundplumbing.com
