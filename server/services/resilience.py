from __future__ import annotations

import asyncio
import logging
import time
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from typing import TypeVar

logger = logging.getLogger(__name__)

T = TypeVar("T")


@dataclass
class CircuitBreaker:
    """Minimal in-process circuit breaker for unstable external dependencies."""

    name: str
    failure_threshold: int
    recovery_timeout_sec: float
    _failures: int = 0
    _open_until: float = 0.0
    _clock: Callable[[], float] = field(default=time.monotonic)

    def allow_request(self) -> bool:
        now = self._clock()
        return now >= self._open_until

    def record_success(self) -> None:
        self._failures = 0
        self._open_until = 0.0

    def record_failure(self) -> None:
        self._failures += 1
        if self._failures < self.failure_threshold:
            return

        self._open_until = self._clock() + self.recovery_timeout_sec
        self._failures = 0
        logger.warning(
            "Circuit opened for %s for %.2fs",
            self.name,
            self.recovery_timeout_sec,
        )


async def retry_async[T](
    operation: Callable[[], Awaitable[T]],
    *,
    attempts: int,
    initial_backoff_sec: float,
    max_backoff_sec: float,
    should_retry: Callable[[Exception], bool],
    operation_name: str,
) -> T:
    """Retry an async operation with exponential backoff."""
    if attempts < 1:
        raise ValueError("attempts must be >= 1")

    delay = max(0.0, initial_backoff_sec)
    for attempt in range(1, attempts + 1):
        try:
            return await operation()
        except Exception as exc:  # pragma: no cover - branch behavior tested via callers
            is_last_attempt = attempt >= attempts
            if is_last_attempt or not should_retry(exc):
                raise

            logger.warning(
                "%s failed (attempt %d/%d): %s; retrying in %.2fs",
                operation_name,
                attempt,
                attempts,
                exc,
                delay,
            )
            await asyncio.sleep(delay)
            delay = min(max_backoff_sec, delay * 2 if delay > 0 else max_backoff_sec)

    # Unreachable because loop returns or raises.
    raise RuntimeError("retry_async exhausted without return")