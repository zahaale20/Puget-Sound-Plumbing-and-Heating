import logging
import os
import time
from collections.abc import AsyncIterator, Callable
from contextlib import asynccontextmanager
from typing import Any
from urllib.parse import urlparse

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from observability import (
    configure_logging,
    http_requests_in_flight,
    init_sentry,
    is_metrics_enabled,
    new_request_id,
    record_request_metrics,
    request_id_var,
)
from routes import blog, captcha, careers, diy_permit, images, newsletter, offers, schedule

load_dotenv()
configure_logging()
init_sentry()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    try:
        yield
    finally:
        from database import close_pool
        await close_pool()


app = FastAPI(title="PSPAH Backend API", lifespan=lifespan)


def _normalize_hostname(hostname: str | None) -> str | None:
    if not hostname:
        return None

    candidate = hostname.strip()
    if not candidate:
        return None

    if "://" in candidate:
        candidate = urlparse(candidate).netloc

    return candidate.split("/", 1)[0].split(":", 1)[0].lower() or None


def _build_allowed_hosts() -> list[str]:
    allowed_hosts = [
        "localhost",
        "127.0.0.1",
        "pugetsoundplumbing.com",
        "www.pugetsoundplumbing.com",
        "cavostudio.com",
        "www.cavostudio.com",
    ]

    vercel_host = _normalize_hostname(os.getenv("VERCEL_URL"))
    if vercel_host:
        allowed_hosts.append(vercel_host)

    if vercel_host and vercel_host.endswith(".vercel.app"):
        allowed_hosts.append("*.vercel.app")

    configured_hosts = os.getenv("ALLOWED_HOSTS", "")
    for host in configured_hosts.split(","):
        normalized_host = _normalize_hostname(host)
        if normalized_host:
            allowed_hosts.append(normalized_host)

    deduped_hosts = []
    seen_hosts = set()
    for host in allowed_hosts:
        if host not in seen_hosts:
            deduped_hosts.append(host)
            seen_hosts.add(host)

    return deduped_hosts

# Setup CORS
_DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:8001",
    "http://127.0.0.1:8001",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://pugetsoundplumbing.com",
    "https://www.pugetsoundplumbing.com",
    "https://cavostudio.com",
    "https://www.cavostudio.com",
]

def _build_cors_origins() -> list[str]:
    env_origins = os.getenv("CORS_ORIGINS")
    if env_origins:
        return [o.strip() for o in env_origins.split(",") if o.strip()]
    return list(_DEFAULT_ORIGINS)

origins = _build_cors_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=_build_allowed_hosts(),
)

# HTTPS redirect is on by default in production. Vercel terminates TLS at the
# edge, so this is mostly a defense-in-depth measure for any non-edge deploy.
# Set ENABLE_HTTPS_REDIRECT=false to opt out (e.g. for local HTTP dev).
if os.getenv("ENABLE_HTTPS_REDIRECT", "true").lower() == "true":
    app.add_middleware(HTTPSRedirectMiddleware)


@app.middleware("http")
async def add_security_headers(request: Request, call_next: Callable[..., Any]) -> Response:
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


_request_logger = logging.getLogger("pspah.requests")


@app.middleware("http")
async def request_id_middleware(request: Request, call_next: Callable[..., Any]) -> Response:
    """Attach an X-Request-ID for cross-system correlation.

    Honours an inbound `X-Request-ID` header (e.g. from a CDN) so traces stay
    consistent across systems; falls back to a freshly generated id otherwise.
    The id is stashed in a contextvar so the structured-log formatter picks it
    up automatically for every log line emitted during the request.
    """
    inbound = request.headers.get("x-request-id", "").strip()
    rid = inbound if 8 <= len(inbound) <= 64 else new_request_id()
    token = request_id_var.set(rid)
    try:
        response = await call_next(request)
    finally:
        request_id_var.reset(token)
    response.headers["X-Request-ID"] = rid
    return response


@app.middleware("http")
async def log_requests(request: Request, call_next: Callable[..., Any]) -> Response:
    start = time.perf_counter()
    if http_requests_in_flight is not None:
        http_requests_in_flight.inc()
    try:
        response = await call_next(request)
    finally:
        if http_requests_in_flight is not None:
            http_requests_in_flight.dec()
    duration_s = time.perf_counter() - start
    _request_logger.info(
        "http_request",
        extra={
            "method": request.method,
            "path": request.url.path,
            "status": response.status_code,
            "duration_ms": round(duration_s * 1000, 1),
        },
    )
    record_request_metrics(request.method, request.url.path, response.status_code, duration_s)
    return response

# "Plug in" the routers
app.include_router(images.router)
app.include_router(blog.router)
app.include_router(captcha.router)
app.include_router(schedule.router)
app.include_router(newsletter.router)
app.include_router(offers.router)
app.include_router(diy_permit.router)
app.include_router(careers.router)

@app.get("/")
async def root() -> dict[str, str]:
    return {"status": "PSPAH API is running"}


# ---------------------------------------------------------------------------
# Health endpoints
# ---------------------------------------------------------------------------
# /health/live  — liveness: is the process up and able to serve traffic?
#                 Lightweight; no external checks.  Restart if this fails.
# /health/ready — readiness: are dependencies (DB) reachable?
#                 Remove from load-balancer rotation if this fails.
# /health       — retained for backwards compatibility; equivalent to /health/ready.
# ---------------------------------------------------------------------------

@app.get("/health/live", tags=["health"])
async def health_live() -> dict[str, str]:
    """Liveness probe — no I/O, always succeeds while the process is alive."""
    return {"status": "alive"}


@app.get("/health/ready", tags=["health"], response_model=None)
async def health_ready() -> dict[str, str] | JSONResponse:
    """Readiness probe — succeeds only when the database is reachable."""
    from database import test_db
    if await test_db():
        return {"status": "ready", "database": "connected"}
    return JSONResponse(status_code=503, content={"status": "not_ready", "database": "disconnected"})


@app.get("/health", tags=["health"], response_model=None)
async def health() -> dict[str, str] | JSONResponse:
    """Backwards-compatible health check — delegates to the readiness probe."""
    from database import test_db
    if await test_db():
        return {"status": "healthy", "database": "connected"}
    return JSONResponse(status_code=503, content={"status": "unhealthy", "database": "disconnected"})


# ---------------------------------------------------------------------------
# Prometheus metrics endpoint
# ---------------------------------------------------------------------------
# Enabled only when ENABLE_METRICS=true.  Optionally gated behind a bearer
# token (METRICS_TOKEN) to prevent public scraping of operational data.
# ---------------------------------------------------------------------------

@app.get("/metrics", tags=["observability"], include_in_schema=False, response_model=None)
async def prometheus_metrics(request: Request) -> JSONResponse | Response:
    """Expose Prometheus metrics if ENABLE_METRICS=true."""
    if not is_metrics_enabled():
        return JSONResponse(status_code=404, content={"detail": "Metrics not enabled"})

    # Optional bearer-token gate
    metrics_token = os.getenv("METRICS_TOKEN", "").strip()
    if metrics_token:
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer ") or auth_header[7:] != metrics_token:
            return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

    try:
        from prometheus_client import CONTENT_TYPE_LATEST, generate_latest
        from starlette.responses import Response
        return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
    except ImportError:
        return JSONResponse(status_code=503, content={"detail": "prometheus_client not installed"})


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)  # nosec B104 - local dev only