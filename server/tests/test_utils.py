from utils import normalize_email, normalize_text, is_duplicate_error, duplicate_response, raise_internal_error
from fastapi import HTTPException
import pytest


class TestNormalizeEmail:
    def test_strips_whitespace_and_lowercases(self):
        assert normalize_email("  Alice@Example.COM  ") == "alice@example.com"

    def test_empty_string(self):
        assert normalize_email("") == ""

    def test_already_normalized(self):
        assert normalize_email("user@test.com") == "user@test.com"


class TestNormalizeText:
    def test_strips_whitespace(self):
        assert normalize_text("  hello  ") == "hello"

    def test_preserves_case(self):
        assert normalize_text("  Hello World  ") == "Hello World"

    def test_empty_string(self):
        assert normalize_text("") == ""


class TestIsDuplicateError:
    def test_unique_constraint(self):
        assert is_duplicate_error(Exception("unique constraint violated"))

    def test_duplicate_key(self):
        assert is_duplicate_error(Exception("duplicate key value"))

    def test_not_duplicate(self):
        assert not is_duplicate_error(Exception("connection timeout"))

    def test_case_insensitive(self):
        assert is_duplicate_error(Exception("UNIQUE violation"))
        assert is_duplicate_error(Exception("DUPLICATE entry"))


class TestDuplicateResponse:
    def test_returns_expected_shape(self):
        result = duplicate_response("Already exists")
        assert result == {
            "success": True,
            "duplicate": True,
            "emailStatus": "skipped",
            "message": "Already exists",
        }


class TestRaiseInternalError:
    def test_raises_http_500(self):
        with pytest.raises(HTTPException) as exc_info:
            raise_internal_error("test context", ValueError("boom"))
        assert exc_info.value.status_code == 500
