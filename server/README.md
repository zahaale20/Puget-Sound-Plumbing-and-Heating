# PSPAH Backend (FastAPI)

Production API for the Puget Sound Plumbing & Heating website. Handles form
submissions (schedule, DIY permit, careers, newsletter, offers), serves blog
content, proxies image URLs, and verifies hCaptcha tokens.

## Stack

- **Framework:** FastAPI + Uvicorn
- **Database:** PostgreSQL (Supabase) via `psycopg2` with a threaded
  connection pool
- **Email:** Resend
- **Storage:** Supabase Storage (resume uploads, image assets)
- **CAPTCHA:** hCaptcha (server-side verification)
- **Deploy:** Vercel (Python serverless)

## Layout

```
server/
├── main.py              # FastAPI app, middleware, router wiring, /health
├── database.py          # Connection pool (configurable via DB_POOL_*)
├── dependencies.py      # FastAPI dependencies (rate limiting)
├── utils.py             # Shared helpers (normalization, duplicate detection)
├── models/requests.py   # Pydantic request models (extra="forbid")
├── routes/              # One router per domain
│   ├── blog.py          # Paginated blog list + view counter
│   ├── schedule.py
│   ├── diy_permit.py
│   ├── careers.py       # Resume upload (size/type/path-traversal safe)
│   ├── newsletter.py    # HMAC-signed unsubscribe links
│   ├── offers.py        # Coupon redemption
│   ├── images.py        # Public image URL proxy w/ prefix whitelist
│   └── captcha.py
├── services/
│   ├── email_service.py     # Resend wrappers + HTML template builders
│   ├── captcha_service.py   # hCaptcha siteverify call
│   ├── storage_service.py   # Supabase Storage (path-traversal hardened)
│   └── rate_limiter.py      # DB-backed per-endpoint rate limiting
└── tests/                   # pytest suite (mocked DB / network)
```

## Local setup

```bash
cd server
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in real values
uvicorn main:app --reload --port 8001
```

Visit `http://127.0.0.1:8001/health` to verify the DB is reachable.

## Configuration

All configuration is via environment variables. See [.env.example](.env.example)
for the full list. Notable defaults:

| Variable | Default | Notes |
|---|---|---|
| `DB_POOL_MAX_CONN` | `20` | Bump for higher concurrency. |
| `DB_STATEMENT_TIMEOUT_MS` | `10000` | Per-statement timeout. |
| `ENABLE_HTTPS_REDIRECT` | `true` | Set `false` only for local HTTP dev. |
| `ALLOW_CAPTCHA_BYPASS` | unset | `true` only in tests/dev. |
| `NEWSLETTER_UNSUBSCRIBE_SECRET` | **required in prod** | Per-process random in dev only; the app refuses to boot in prod without it. |

## Tests

```bash
cd server
pytest                      # runs the suite, gates on coverage (>= 60%)
pytest --no-cov tests/<f>   # run a single file without the coverage gate
```

The test suite is fully isolated — no real database, network, or email is
required. See [`tests/conftest.py`](tests/conftest.py) for the test env seed.

## Architectural notes

- **Email sends are off the request critical path.** Customer-facing
  confirmation emails are sent inline (their `emailStatus` is reported back
  to the client), but company notification emails are dispatched via
  FastAPI `BackgroundTasks` so a slow Resend response cannot block a form
  submission, and a failure in a non-critical email cannot fail the request.
- **Rate limiting fails open.** If the rate-limit DB query errors, requests
  are allowed through with a warning logged. Better to serve traffic than
  wedge the API on a transient DB issue.
- **Duplicate submissions return success + a `duplicate: true` flag** instead
  of raising — keeps the UX friendly while preventing double-inserts via
  unique constraints.
- **All SQL is parameterized.** No string concatenation into queries.
- **Resume uploads** are validated by extension, content-type, size, and
  filename sanitization before being stored in Supabase under a UUID prefix.
- **Storage URLs** are restricted to a small prefix whitelist (`blog/`,
  `site/`, `logo/`) to prevent path traversal.

## Deploy

The `server/vercel.json` config maps all routes to `main.py` and adds the
same security headers also set by the FastAPI middleware (defense in depth).
Set the env vars from `.env.example` in the Vercel project settings.
