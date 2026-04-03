import os
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from routes import images, email
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="PSPAH Backend API")

# Setup CORS
origins = [
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=[
        "localhost",
        "127.0.0.1",
        "pugetsoundplumbing.com",
        "www.pugetsoundplumbing.com",
        "cavostudio.com",
        "www.cavostudio.com",
    ],
)

if os.getenv("ENABLE_HTTPS_REDIRECT", "false").lower() == "true":
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

# "Plug in" the routers
app.include_router(images.router)
app.include_router(email.router)
# app.include_router(leads.router) # Uncomment once leads.py is built

@app.get("/")
async def root():
    return {"status": "PSPAH API is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)