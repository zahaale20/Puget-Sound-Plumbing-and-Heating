"""Focused tests for /api/newsletter/unsubscribe behavior and token validation."""

from unittest.mock import MagicMock

from fastapi import HTTPException
from fastapi.testclient import TestClient


def _client():
    from main import app

    return TestClient(app, base_url="http://localhost")


class _DeleteCursor:
    def __init__(self, deleted_rows):
        self.rowcount = deleted_rows

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def execute(self, query, params):
        return None


class _DeleteConnection:
    def __init__(self, deleted_rows=1):
        self.deleted_rows = deleted_rows
        self.commit = MagicMock()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def cursor(self):
        return _DeleteCursor(self.deleted_rows)


class TestUnsubscribeEndpoint:
    def test_unsubscribe_rate_limited_returns_429(self, monkeypatch):
        import routes.email as mod

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, endpoint: (False, "Too many unsubscribe requests"))

        response = _client().get("/api/newsletter/unsubscribe?email=user@example.com&token=abc")

        assert response.status_code == 429
        assert response.json()["detail"] == "Too many unsubscribe requests"

    def test_unsubscribe_missing_token_returns_400(self, monkeypatch):
        import routes.email as mod

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, endpoint: (True, None))

        response = _client().get("/api/newsletter/unsubscribe?email=user@example.com")

        assert response.status_code == 400
        assert response.json()["detail"] == "Unsubscribe token is required."

    def test_unsubscribe_invalid_token_returns_400(self, monkeypatch):
        import routes.email as mod

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, endpoint: (True, None))

        response = _client().get("/api/newsletter/unsubscribe?email=user@example.com&token=wrong-token")

        assert response.status_code == 400
        assert response.json()["detail"] == "Invalid unsubscribe link."

    def test_unsubscribe_success_still_returns_html_if_confirmation_email_fails(self, monkeypatch):
        import routes.email as mod

        token = mod._generate_newsletter_unsubscribe_token("user@example.com")

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, endpoint: (True, None))
        monkeypatch.setattr(mod, "get_db_connection", lambda: _DeleteConnection(deleted_rows=1))
        monkeypatch.setattr(
            mod,
            "_send_newsletter_unsubscribe_confirmation_email",
            MagicMock(side_effect=HTTPException(status_code=500, detail="mail down")),
        )
        notify_company = MagicMock()
        monkeypatch.setattr(mod, "_send_newsletter_unsubscribe_notification_email", notify_company)

        response = _client().get(f"/api/newsletter/unsubscribe?email=user@example.com&token={token}")

        assert response.status_code == 200
        assert "You've Been Unsubscribed" in response.text
        notify_company.assert_called_once_with("user@example.com")
