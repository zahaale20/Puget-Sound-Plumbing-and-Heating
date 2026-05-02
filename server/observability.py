"""Structured logging + request correlation + optional Prometheus metrics.

When LOG_FORMAT=json, every record is emitted as a single-line JSON object
suitable for ingestion by Vercel logs, Datadog, CloudWatch, etc. Each record
carries the `request_id` of the in-flight HTTP request when one is present,
so all logs from a single request can be correlated downstream.

When ENABLE_METRICS=true (default: false), Prometheus metrics are exposed at
GET /metrics.  The endpoint is gated on an ``METRICS_TOKEN`` bearer token when
that env var is set, so it is safe to expose in semi-public deployments.

Usage:
    from observability import configure_logging, request_id_var
    configure_logging()
    logger.info("user signed up", extra={"email": email})
"""

from __future__ import annotations

import json
import logging
import os
import sys
import time
import uuid
from contextvars import ContextVar
from typing import Any

# Per-request correlation ID. Set by the request middleware and read by the
# log formatter so every log line emitted *during* a request carries it.
request_id_var: ContextVar[str | None] = ContextVar("request_id", default=None)


_BUILTIN_LOGRECORD_ATTRS = {
    "name", "msg", "args", "levelname", "levelno", "pathname", "filename",
    "module", "exc_info", "exc_text", "stack_info", "lineno", "funcName",
    "created", "msecs", "relativeCreated", "thread", "threadName",
    "processName", "process", "message", "asctime", "taskName",
}


class JsonFormatter(logging.Formatter):
    """Emit logs as one JSON object per line."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(record.created))
                         + f".{int(record.msecs):03d}Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        rid = request_id_var.get()
        if rid:
            payload["request_id"] = rid
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        # Anything passed via `extra={...}` lands as an attribute on the record.
        for key, value in record.__dict__.items():
            if key in _BUILTIN_LOGRECORD_ATTRS or key.startswith("_"):
                continue
            try:
                json.dumps(value)
                payload[key] = value
            except (TypeError, ValueError):
                payload[key] = repr(value)
        return json.dumps(payload, separators=(",", ":"))


class RequestIdFilter(logging.Filter):
    """Inject the active request_id onto every record (text formatter path)."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_var.get() or "-"
        return True


def configure_logging() -> None:
    """Configure the root logger from env. Idempotent."""
    level = os.getenv("LOG_LEVEL", "INFO").upper()
    log_format = os.getenv("LOG_FORMAT", "text").lower()

    handler = logging.StreamHandler(sys.stdout)
    handler.addFilter(RequestIdFilter())

    if log_format == "json":
        handler.setFormatter(JsonFormatter())
    else:
        handler.setFormatter(
            logging.Formatter(
                "%(asctime)s [%(levelname)s] [rid=%(request_id)s] %(name)s: %(message)s"
            )
        )

    root = logging.getLogger()
    # Replace existing handlers so we don't double-log under reloaders.
    for h in list(root.handlers):
        root.removeHandler(h)
    root.addHandler(handler)
    root.setLevel(level)

    # Silence noisy third-party loggers.
    for noisy in ("urllib3", "httpcore", "asyncio"):
        logging.getLogger(noisy).setLevel(logging.WARNING)


def init_sentry() -> bool:
    """Initialise Sentry if SENTRY_DSN is configured. Returns True on success."""
    dsn = os.getenv("SENTRY_DSN")
    if not dsn:
        return False
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.starlette import StarletteIntegration
    except ImportError:
        logging.getLogger(__name__).warning(
            "SENTRY_DSN set but sentry-sdk not installed; skipping Sentry init."
        )
        return False

    sentry_sdk.init(
        dsn=dsn,
        environment=os.getenv("SENTRY_ENVIRONMENT", "production"),
        traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
        send_default_pii=False,
        integrations=[
            FastApiIntegration(transaction_style="endpoint"),
            StarletteIntegration(transaction_style="endpoint"),
        ],
    )
    return True


def new_request_id() -> str:
    """Generate a short, URL-safe request ID."""
    return uuid.uuid4().hex[:16]


# ---------------------------------------------------------------------------
# Optional Prometheus metrics
# ---------------------------------------------------------------------------
# Enabled only when ENABLE_METRICS=true to keep the default deployment
# footprint small.  `prometheus_client` is listed as an optional dependency;
# if missing and metrics are enabled, a warning is logged and the app starts
# normally without them.
# ---------------------------------------------------------------------------

_metrics_enabled: bool = os.getenv("ENABLE_METRICS", "false").lower() == "true"

# Module-level metric objects — None when prometheus_client is unavailable.
http_requests_total = None
http_request_duration_seconds = None
http_requests_in_flight = None

if _metrics_enabled:
    try:
        from prometheus_client import (
            Counter,
            Gauge,
            Histogram,
        )

        _DURATION_BUCKETS = (
            0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0
        )

        http_requests_total = Counter(
            "http_requests_total",
            "Total HTTP requests by method, path, and status code.",
            ["method", "path", "status"],
        )
        http_request_duration_seconds = Histogram(
            "http_request_duration_seconds",
            "HTTP request latency in seconds.",
            ["method", "path"],
            buckets=_DURATION_BUCKETS,
        )
        http_requests_in_flight = Gauge(
            "http_requests_in_flight",
            "Number of HTTP requests currently being processed.",
        )

    except ImportError:
        logging.getLogger(__name__).warning(
            "ENABLE_METRICS=true but prometheus_client is not installed; "
            "metrics will not be collected.  Run: pip install prometheus-client"
        )
        _metrics_enabled = False


def record_request_metrics(method: str, path: str, status: int, duration_s: float) -> None:
    """Record per-request Prometheus metrics.

    No-ops when metrics are disabled or prometheus_client is unavailable.
    Path is normalised minimally: only the first two segments are kept to
    prevent high-cardinality labels from UUID/ID fragments.
    """
    if not _metrics_enabled:
        return

    # Normalise path to keep cardinality low: e.g. /blog/123/comments -> /blog/{id}
    # Simple heuristic: replace path segments that look like IDs with "{id}".
    import re
    normalised = re.sub(r"/[0-9a-f]{8,}(?:/|$)", "/{id}/", path).rstrip("/") or "/"

    if http_requests_total is not None:
        http_requests_total.labels(method=method, path=normalised, status=str(status)).inc()
    if http_request_duration_seconds is not None:
        http_request_duration_seconds.labels(method=method, path=normalised).observe(duration_s)


def is_metrics_enabled() -> bool:
    """Return True when Prometheus metrics collection is active."""
    return _metrics_enabled
