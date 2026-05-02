# PSPAH Website Frontend (client)

This is the frontend for the Puget Sound Plumbing and Heating website, built with Vite, React, and Tailwind CSS.

## Features
- Modern React SPA with fast routing and code splitting
- Tailwind CSS for utility-first styling
- SEO: prerendering, sitemap, audit scripts
- hCaptcha integration for forms
- Playwright E2E and Vitest unit tests
- Form validation, live chat, and dynamic offers

## Directory Structure
- `src/` — Main source code
  - `components/` — UI, layout, forms, SEO, and section components
  - `pages/` — Top-level route pages (Home, About, Blog, Offers, etc.)
  - `services/` — API and utility services (email, blog, image, validation)
  - `hooks/` — Custom React hooks
  - `data/` — Static or mock data
- `e2e/` — Playwright E2E tests
- `public/` — Static assets, robots.txt, sitemap.xml
- `scripts/` — SEO, prerender, bundle analysis scripts

## Scripts
- `npm run dev` — Start local dev server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm test` — Run unit tests (Vitest)
- `npm run test:e2e` — Run Playwright E2E tests
- `npm run test:e2e:full-stack` — Run the Docker Postgres + FastAPI + Playwright smoke test
- `npm run lint` — Lint code with ESLint
- `npm run format` — Format code with Prettier

## Full-stack smoke test
The default Playwright suite keeps API responses mocked for fast frontend acceptance coverage. Use
`npm run test:e2e:full-stack` when a change needs a true backend/database check. The command starts
the disposable Docker Compose stack in [../docker-compose.full-stack-smoke.yml](../docker-compose.full-stack-smoke.yml), runs Alembic migrations, serves the Vite app with `VITE_API_BASE_URL=http://127.0.0.1:8000`, and verifies the default DIY permit path persists `inspection = "unsure"` in Docker Postgres.
The stack uses the real FastAPI app and database while setting `EMAIL_DRY_RUN=true` so no Resend email is sent.

## Environment
- Copy `.env.example` to `.env` and fill in required values (API URLs, hCaptcha keys, etc).

## Deployment
- Deployed via Vercel (`vercel.json` for rewrites, redirects, and security headers)

## Contributing
- Use Prettier and ESLint for code style
- Add/maintain tests for all components and services
- PRs and issues welcome
