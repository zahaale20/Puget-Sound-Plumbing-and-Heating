import logging
from typing import Any, NoReturn

from fastapi import HTTPException
from psycopg import errors as psycopg_errors

logger = logging.getLogger(__name__)

# PostgreSQL SQLSTATE for unique_violation. See:
# https://www.postgresql.org/docs/current/errcodes-appendix.html
_UNIQUE_VIOLATION_SQLSTATE = "23505"


def normalize_email(email: str) -> str:
    return email.strip().lower()


def normalize_text(value: str) -> str:
    return value.strip()


def is_duplicate_error(error: Exception) -> bool:
    """Return True if `error` represents a Postgres unique constraint violation.

    Detection is based on the driver's exception type and SQLSTATE (23505),
    which is locale- and driver-version independent. Falls back to checking
    a `sqlstate` attribute for wrapped exceptions.
    """
    if isinstance(error, psycopg_errors.UniqueViolation):
        return True
    sqlstate = getattr(error, "sqlstate", None) or getattr(error, "pgcode", None)
    return sqlstate == _UNIQUE_VIOLATION_SQLSTATE


def duplicate_response(message: str) -> dict[str, Any]:
    return {
        "success": True,
        "duplicate": True,
        "emailStatus": "skipped",
        "message": message,
    }


def raise_internal_error(context: str, error: Exception) -> NoReturn:
    logger.exception("%s: %s", context, str(error))
    raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again.")
