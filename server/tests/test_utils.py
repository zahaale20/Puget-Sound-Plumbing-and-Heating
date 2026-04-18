import pytest
from fastapi import HTTPException

from utils import (
    duplicate_response,
    is_duplicate_error,
    normalize_email,
    normalize_text,
    raise_internal_error,
)


class TestNormalizeEmail:
    def test_strips_whitespace_and_lowercases(self) -> None:
        assert normalize_email("  Alice@Example.COM  ") == "alice@example.com"

    def test_empty_string(self) -> None:
        assert normalize_email("") == ""

    def test_already_normalized(self) -> None:
        assert normalize_email("user@test.com") == "user@test.com"


class TestNormalizeText:
    def test_strips_whitespace(self) -> None:
        assert normalize_text("  hello  ") == "hello"

    def test_preserves_case(self) -> None:
        assert normalize_text("  Hello World  ") == "Hello World"

    def test_empty_string(self) -> None:
        assert normalize_text("") == ""


class TestIsDuplicateError:
    def test_psycopg_unique_violation_class(self) -> None:
        from psycopg.errors import UniqueViolation

        # UniqueViolation can't always be instantiated with full diag info,
        # but isinstance check is what matters in production.
        err = UniqueViolation.__new__(UniqueViolation)
        assert is_duplicate_error(err)

    def test_sqlstate_attribute_23505(self) -> None:
        err = Exception("some db error")
        err.sqlstate = "23505"  # type: ignore[attr-defined]
        assert is_duplicate_error(err)

    def test_pgcode_attribute_23505(self) -> None:
        # Some wrappers expose `pgcode` instead of `sqlstate`.
        err = Exception("some db error")
        err.pgcode = "23505"  # type: ignore[attr-defined]
        assert is_duplicate_error(err)

    def test_other_sqlstate_is_not_duplicate(self) -> None:
        err = Exception("foreign key violation")
        err.sqlstate = "23503"  # type: ignore[attr-defined]
        assert not is_duplicate_error(err)

    def test_plain_exception_is_not_duplicate(self) -> None:
        assert not is_duplicate_error(Exception("connection timeout"))

    def test_message_text_no_longer_matches(self) -> None:
        # Detection must not rely on string matching against the message.
        assert not is_duplicate_error(Exception("unique constraint violated"))
        assert not is_duplicate_error(Exception("duplicate key value"))


class TestDuplicateResponse:
    def test_returns_expected_shape(self) -> None:
        result = duplicate_response("Already exists")
        assert result == {
            "success": True,
            "duplicate": True,
            "emailStatus": "skipped",
            "message": "Already exists",
        }


class TestRaiseInternalError:
    def test_raises_http_500(self) -> None:
        with pytest.raises(HTTPException) as exc_info:
            raise_internal_error("test context", ValueError("boom"))
        assert exc_info.value.status_code == 500
