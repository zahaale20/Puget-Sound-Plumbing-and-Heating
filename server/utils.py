import logging
import re
import html
from fastapi import HTTPException

logger = logging.getLogger(__name__)


def normalize_email(email: str) -> str:
    return email.strip().lower()


def normalize_text(value: str) -> str:
    return value.strip()


def is_duplicate_error(error: Exception) -> bool:
    error_text = str(error).lower()
    return "unique" in error_text or "duplicate" in error_text


def duplicate_response(message: str):
    return {
        "success": True,
        "duplicate": True,
        "emailStatus": "skipped",
        "message": message,
    }


def raise_internal_error(context: str, error: Exception):
    logger.exception("%s: %s", context, str(error))
    raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again.")
