import ipaddress
import os
from collections.abc import Callable
from typing import Any

from fastapi import HTTPException, Request

TRUST_PROXY_HEADERS = os.getenv("TRUST_PROXY_HEADERS", "false").lower() == "true"
TRUSTED_PROXY_IPS = os.getenv("TRUSTED_PROXY_IPS", "127.0.0.1,::1")
_FALLBACK_CLIENT_IP = "0.0.0.0"  # nosec B104 - placeholder when no client info is available

IPAddress = ipaddress.IPv4Address | ipaddress.IPv6Address


def _parse_ip(raw_value: str | None) -> IPAddress | None:
    """Parse and canonicalize an IP address-like value from a request header."""
    if not raw_value:
        return None

    candidate = raw_value.strip().strip('"')
    if not candidate:
        return None

    if candidate.startswith("[") and "]" in candidate:
        candidate = candidate[1:candidate.index("]")]

    try:
        return ipaddress.ip_address(candidate)
    except ValueError:
        if candidate.count(":") == 1:
            host, _, _port = candidate.rpartition(":")
            try:
                return ipaddress.ip_address(host)
            except ValueError:
                return None
    return None


def _is_trusted_proxy(ip: IPAddress) -> bool:
    """Return whether an IP is an explicitly trusted proxy hop."""
    proxy_config = TRUSTED_PROXY_IPS.strip()
    if proxy_config == "*":
        return True

    for raw_network in proxy_config.split(","):
        network = raw_network.strip()
        if not network:
            continue
        try:
            if ip in ipaddress.ip_network(network, strict=False):
                return True
        except ValueError:
            continue
    return False


def _forwarded_for_chain(header_value: str | None) -> list[IPAddress]:
    if not header_value:
        return []
    return [ip for item in header_value.split(",") if (ip := _parse_ip(item)) is not None]


def get_client_ip(request: Request) -> str:
    """Extract a stable, spoof-resistant client IP for rate limiting.

    Forwarded headers are honored only when the immediate peer is in the
    configured trusted proxy list. The selected address is the nearest
    untrusted hop from the right side of the X-Forwarded-For chain, which
    prevents user-supplied spoofed entries from becoming the rate-limit key.
    """
    peer_ip = _parse_ip(request.client.host if request.client else None)
    if not TRUST_PROXY_HEADERS or peer_ip is None or not _is_trusted_proxy(peer_ip):
        return str(peer_ip) if peer_ip is not None else _FALLBACK_CLIENT_IP

    forwarded_chain = _forwarded_for_chain(request.headers.get("x-forwarded-for"))
    if not forwarded_chain:
        return str(peer_ip)

    for candidate in reversed(forwarded_chain):
        if not _is_trusted_proxy(candidate):
            return str(candidate)

    return str(forwarded_chain[0])


def require_rate_limit(endpoint: str) -> Callable[..., Any]:
    """FastAPI dependency that enforces rate limiting before body parsing.

    Usage:
        @router.post("/schedule", dependencies=[Depends(require_rate_limit("schedule"))])
    """
    async def _check(request: Request) -> None:
        from services.rate_limiter import check_rate_limit

        ip = get_client_ip(request)
        is_allowed, msg, retry_after = await check_rate_limit(ip, endpoint)
        if not is_allowed:
            raise HTTPException(
                status_code=429,
                detail=msg,
                headers={"Retry-After": str(retry_after)},
            )

    return _check
