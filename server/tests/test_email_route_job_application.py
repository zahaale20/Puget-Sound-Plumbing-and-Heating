"""Focused tests for /api/job-application and resume validation helper branches."""

from types import SimpleNamespace
from unittest.mock import MagicMock

from fastapi import HTTPException
from fastapi.testclient import TestClient
import pytest


def _client():
    from main import app

    return TestClient(app, base_url="http://localhost")


class _InsertCursor:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def execute(self, query, params):
        return None


class _InsertConnection:
    def __init__(self):
        self.commit = MagicMock()
        self.rollback = MagicMock()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def cursor(self):
        return _InsertCursor()


class _DuplicateInsertCursor:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def execute(self, query, params):
        raise Exception("duplicate key value violates unique constraint")


class _DuplicateInsertConnection:
    def __init__(self):
        self.commit = MagicMock()
        self.rollback = MagicMock()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def cursor(self):
        return _DuplicateInsertCursor()


class TestJobApplicationEndpoint:
    def test_job_application_rate_limit_returns_429(self, monkeypatch):
        import routes.careers as mod

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, endpoint: (False, "Too many applications"))

        response = _client().post(
            "/api/job-application",
            data={
                "firstName": "Alex",
                "lastName": "Stone",
                "phone": "2065550100",
                "email": "alex@example.com",
                "position": "Technician",
            },
        )

        assert response.status_code == 429
        assert response.json()["detail"] == "Too many applications"

    def test_job_application_captcha_failure_returns_403(self, monkeypatch):
        import routes.careers as mod

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, endpoint: (True, None))
        monkeypatch.setattr(mod, "verify_captcha", lambda token: False)

        response = _client().post(
            "/api/job-application",
            data={
                "firstName": "Alex",
                "lastName": "Stone",
                "phone": "2065550100",
                "email": "alex@example.com",
                "position": "Technician",
                "captchaToken": "bad",
            },
        )

        assert response.status_code == 403
        assert response.json()["detail"] == "Security verification failed. Please try again."

    def test_job_application_duplicate_returns_skipped(self, monkeypatch):
        import routes.careers as mod

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, endpoint: (True, None))
        monkeypatch.setattr(mod, "verify_captcha", lambda token: True)
        monkeypatch.setattr(mod, "get_db_connection", lambda: _DuplicateInsertConnection())
        send_confirm = MagicMock()
        monkeypatch.setattr(mod, "send_job_application_confirmation", send_confirm)

        response = _client().post(
            "/api/job-application",
            data={
                "firstName": "Alex",
                "lastName": "Stone",
                "phone": "2065550100",
                "email": "alex@example.com",
                "position": "Technician",
                "captchaToken": "ok",
            },
        )

        assert response.status_code == 200
        assert response.json()["duplicate"] is True
        assert response.json()["emailStatus"] == "skipped"
        send_confirm.assert_not_called()

    def test_job_application_email_failure_returns_failed_status(self, monkeypatch):
        import routes.careers as mod

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, endpoint: (True, None))
        monkeypatch.setattr(mod, "verify_captcha", lambda token: True)
        monkeypatch.setattr(mod, "get_db_connection", lambda: _InsertConnection())
        monkeypatch.setattr(
            mod,
            "send_job_application_confirmation",
            MagicMock(side_effect=HTTPException(status_code=500, detail="mail provider down")),
        )

        response = _client().post(
            "/api/job-application",
            data={
                "firstName": "Alex",
                "lastName": "Stone",
                "phone": "2065550100",
                "email": "alex@example.com",
                "position": "Technician",
                "captchaToken": "ok",
            },
        )

        assert response.status_code == 200
        assert response.json() == {
            "success": True,
            "emailStatus": "failed",
            "message": "Application saved, but email notification could not be sent.",
        }

    def test_job_application_resume_invalid_extension_returns_internal_error(self, monkeypatch):
        import routes.careers as mod

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, endpoint: (True, None))
        monkeypatch.setattr(mod, "verify_captcha", lambda token: True)
        monkeypatch.setattr(mod, "get_db_connection", lambda: _InsertConnection())

        response = _client().post(
            "/api/job-application",
            data={
                "firstName": "Alex",
                "lastName": "Stone",
                "phone": "2065550100",
                "email": "alex@example.com",
                "position": "Technician",
                "captchaToken": "ok",
            },
            files={"resume": ("resume.txt", b"hello", "text/plain")},
        )

        assert response.status_code == 500
        assert response.json()["detail"] == "An unexpected error occurred. Please try again."

    def test_job_application_resume_too_large_returns_internal_error(self, monkeypatch):
        import routes.careers as mod

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, endpoint: (True, None))
        monkeypatch.setattr(mod, "verify_captcha", lambda token: True)
        monkeypatch.setattr(mod, "get_db_connection", lambda: _InsertConnection())
        monkeypatch.setattr(mod, "MAX_RESUME_SIZE_BYTES", 4)

        response = _client().post(
            "/api/job-application",
            data={
                "firstName": "Alex",
                "lastName": "Stone",
                "phone": "2065550100",
                "email": "alex@example.com",
                "position": "Technician",
                "captchaToken": "ok",
            },
            files={"resume": ("resume.pdf", b"012345", "application/pdf")},
        )

        assert response.status_code == 500
        assert response.json()["detail"] == "An unexpected error occurred. Please try again."

    def test_job_application_resume_upload_fail_still_succeeds(self, monkeypatch):
        import routes.careers as mod

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, endpoint: (True, None))
        monkeypatch.setattr(mod, "verify_captcha", lambda token: True)
        monkeypatch.setattr(mod, "get_db_connection", lambda: _InsertConnection())
        monkeypatch.setattr(mod.storage_service, "upload_resume", lambda data, filename: None)
        send_confirm = MagicMock()
        send_notify = MagicMock()
        monkeypatch.setattr(mod, "send_job_application_confirmation", send_confirm)
        monkeypatch.setattr(mod, "send_job_application_notification", send_notify)

        response = _client().post(
            "/api/job-application",
            data={
                "firstName": "Alex",
                "lastName": "Stone",
                "phone": "2065550100",
                "email": "alex@example.com",
                "position": "Technician",
                "captchaToken": "ok",
            },
            files={"resume": ("resume.pdf", b"pdf-data", "application/pdf")},
        )

        assert response.status_code == 200
        assert response.json() == {"success": True, "emailStatus": "sent"}
        send_confirm.assert_called_once()
        send_notify.assert_called_once()


class TestResumeValidationHelper:
    def test_validate_resume_upload_empty_file_raises_400(self):
        import routes.careers as mod

        resume = SimpleNamespace(filename="resume.pdf", content_type="application/pdf")

        with pytest.raises(HTTPException) as exc_info:
            mod.validate_resume_upload(resume, b"")

        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "Uploaded resume is empty"

    def test_validate_resume_upload_unsupported_content_type_raises_400(self):
        import routes.careers as mod

        resume = SimpleNamespace(filename="resume.pdf", content_type="image/png")

        with pytest.raises(HTTPException) as exc_info:
            mod.validate_resume_upload(resume, b"pdf-bytes")

        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "Unsupported resume content type"
