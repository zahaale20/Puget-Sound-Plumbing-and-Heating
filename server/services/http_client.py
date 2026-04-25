"""Shared httpx.AsyncClient for outbound HTTP.

Re-instantiating httpx.AsyncClient per request throws away the connection
pool, keep-alive, and TLS session — costing 50–150ms per external call and
extra CPU under load. We keep a single module-level client and close it on
app shutdown via the FastAPI lifespan hook.
"""

from __future__ import annotations

import asyncio
import os

import httpx

_HTTP_MAX_CONNECTIONS = int(os.getenv("HTTP_MAX_CONNECTIONS", "50"))
_HTTP_MAX_KEEPALIVE = int(os.getenv("HTTP_MAX_KEEPALIVE", "20"))
_HTTP_KEEPALIVE_EXPIRY = float(os.getenv("HTTP_KEEPALIVE_EXPIRY_SEC", "30"))

_client: httpx.AsyncClient | None = None
_lock = asyncio.Lock()


def _build_client() -> httpx.AsyncClient:
    limits = httpx.Limits(
        max_connections=_HTTP_MAX_CONNECTIONS,
        max_keepalive_connections=_HTTP_MAX_KEEPALIVE,
        keepalive_expiry=_HTTP_KEEPALIVE_EXPIRY,
    )
    # Per-call timeouts override this default; we set a sane ceiling here.
    return httpx.AsyncClient(timeout=httpx.Timeout(15.0), limits=limits)


async def get_http_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        async with _lock:
            if _client is None or _client.is_closed:
                _client = _build_client()
    return _client


async def close_http_client() -> None:
    global _client
    client = _client
    _client = None
    if client is not None and not client.is_closed:
        await client.aclose()
