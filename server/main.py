import os
import logging
import time
import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from urllib.parse import urlparse
from routes import images, blog, captcha, schedule, newsletter, offers, diy_permit, careers
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="PSPAH Backend API")


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
    "http://pugetsoundplumbing.com",
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
async def add_security_headers(request: Request, call_next):
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
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    _request_logger.info(
        "%s %s %s %.1fms",
        request.method, request.url.path, response.status_code, duration_ms,
    )
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
async def root():
    return {"status": "PSPAH API is running"}

@app.get("/health")
async def health():
    from database import test_db
    if test_db():
        return {"status": "healthy", "database": "connected"}
    return JSONResponse(status_code=503, content={"status": "unhealthy", "database": "disconnected"})

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)