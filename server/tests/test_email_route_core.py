"""Core API failure-path tests for /api verify-captcha, send-email, schedule, and newsletter."""

from unittest.mock import MagicMock

from fastapi import HTTPException
from fastapi.testclient import TestClient


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


class TestCaptchaEndpoint:
    def test_verify_captcha_rate_limited(self, monkeypatch):
        import routes.email as mod

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, endpoint: (False, "Too many requests"))

        response = _client().post("/api/verify-captcha", json={"token": "abc"})

        assert response.status_code == 429
        assert response.json()["detail"] == "Too many requests"


class TestSendEmailEndpoint:
    def test_send_email_captcha_failure_returns_403(self, monkeypatch):
        import routes.email as mod

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, endpoint: (True, None))
        monkeypatch.setattr(mod, "_verify_captcha", lambda token: False)

        response = _client().post(
            "/api/send-email",
            json={
                "email": "person@example.com",
                "firstName": "Taylor",
                "captchaToken": "bad-token",
            },
        )

        assert response.status_code == 403
        assert response.json()["detail"] == "Security verification failed. Please try again."

    def test_send_email_unexpected_error_returns_500(self, monkeypatch):
        import routes.email as mod

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, endpoint: (True, None))
        monkeypatch.setattr(mod, "_verify_captcha", lambda token: True)
        monkeypatch.setattr(mod, "_send_followup_email", MagicMock(side_effect=Exception("email service down")))

        response = _client().post(
            "/api/send-email",
            json={
                "email": "person@example.com",
                "firstName": "Taylor",
                "captchaToken": "good-token",
            },
        )

        assert response.status_code == 500
        assert response.json()["detail"] == "An unexpected error occurred. Please try again."


class TestScheduleEndpoint:
    def test_schedule_db_error_returns_500(self, monkeypatch):
        import routes.email as mod

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, endpoint: (True, None))
        monkeypatch.setattr(mod, "_verify_captcha", lambda token: True)
        monkeypatch.setattr(mod, "get_db_connection", MagicMock(side_effect=Exception("db down")))

        response = _client().post(
            "/api/schedule",
            json={
                "firstName": "Jane",
                "lastName": "Doe",
                "phone": "2065550100",
                "email": "jane@example.com",
                "message": "Need an appointment",
                "captchaToken": "token",
            },
        )

        assert response.status_code == 500
        assert response.json()["detail"] == "An unexpected error occurred. Please try again."


class TestNewsletterEndpoint:
    def test_newsletter_rate_limit_returns_429(self, monkeypatch):
        import routes.email as mod

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, endpoint: (False, "Rate limit exceeded"))

        response = _client().post(
            "/api/newsletter",
            json={"email": "subscriber@example.com", "captchaToken": "token"},
        )

        assert response.status_code == 429
        assert response.json()["detail"] == "Rate limit exceeded"

    def test_newsletter_confirmation_email_failure_returns_failed_status(self, monkeypatch):
        import routes.email as mod

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, endpoint: (True, None))
        monkeypatch.setattr(mod, "_verify_captcha", lambda token: True)
        monkeypatch.setattr(mod, "get_db_connection", lambda: _InsertConnection())
        monkeypatch.setattr(mod, "_build_newsletter_unsubscribe_url", lambda email: "https://example.com/unsub")
        monkeypatch.setattr(
            mod,
            "_send_newsletter_confirmation_email",
            MagicMock(side_effect=HTTPException(status_code=500, detail="provider failed")),
        )
        notify_company = MagicMock()
        monkeypatch.setattr(mod, "_send_newsletter_notification_email", notify_company)

        response = _client().post(
            "/api/newsletter",
            json={"email": "subscriber@example.com", "captchaToken": "token"},
        )

        assert response.status_code == 200
        assert response.json() == {
            "success": True,
            "emailStatus": "failed",
            "message": "Subscription saved, but confirmation email could not be sent.",
        }
        notify_company.assert_not_called()
