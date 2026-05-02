from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException

from routes import newsletter as newsletter_module
from tests.conftest import make_async_cursor, make_async_db, make_unique_violation


def _ok_rate_limit():
    return AsyncMock(return_value=(True, "OK", 0))


def _denied_rate_limit():
    return AsyncMock(return_value=(False, "Too many", 3600))


VALID_EMAIL = "user@example.com"


class TestSubscribeNewsletter:
    def test_success(self, client) -> None:
        factory, _ = make_async_db()
        with (
            patch("routes.newsletter.get_db_connection", factory),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.newsletter.verify_captcha", new_callable=AsyncMock, return_value=True),
            patch("routes.newsletter.send_newsletter_confirmation", new_callable=AsyncMock),
            patch("routes.newsletter.send_newsletter_notification", new_callable=AsyncMock),
        ):
            resp = client.post(
                "/api/newsletter",
                json={"email": VALID_EMAIL, "captchaToken": "tok"},
            )
        assert resp.status_code == 200
        body = resp.json()
        assert body["success"] is True
        assert body["emailStatus"] == "sent"

    def test_rate_limited(self, client) -> None:
        with patch("services.rate_limiter.check_rate_limit", _denied_rate_limit()):
            resp = client.post(
                "/api/newsletter",
                json={"email": VALID_EMAIL, "captchaToken": "tok"},
            )
        assert resp.status_code == 429

    def test_captcha_failed(self, client) -> None:
        with (
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.newsletter.verify_captcha", new_callable=AsyncMock, return_value=False),
        ):
            resp = client.post(
                "/api/newsletter",
                json={"email": VALID_EMAIL, "captchaToken": "tok"},
            )
        assert resp.status_code == 403

    def test_duplicate_subscriber(self, client) -> None:
        cur = make_async_cursor(execute_side_effect=make_unique_violation())
        factory, _ = make_async_db(cur)
        with (
            patch("routes.newsletter.get_db_connection", factory),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.newsletter.verify_captcha", new_callable=AsyncMock, return_value=True),
            patch("routes.newsletter.send_newsletter_confirmation", new_callable=AsyncMock) as mock_send,
        ):
            resp = client.post(
                "/api/newsletter",
                json={"email": VALID_EMAIL, "captchaToken": "tok"},
            )
        assert resp.status_code == 200
        body = resp.json()
        assert body["duplicate"] is True
        assert body["emailStatus"] == "skipped"
        mock_send.assert_not_called()

    def test_email_failure_returns_failed_status(self, client) -> None:
        factory, _ = make_async_db()
        with (
            patch("routes.newsletter.get_db_connection", factory),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.newsletter.verify_captcha", new_callable=AsyncMock, return_value=True),
            patch(
                "routes.newsletter.send_newsletter_confirmation",
                new_callable=AsyncMock,
                side_effect=HTTPException(500, "email err"),
            ),
        ):
            resp = client.post(
                "/api/newsletter",
                json={"email": VALID_EMAIL, "captchaToken": "tok"},
            )
        assert resp.status_code == 200
        body = resp.json()
        assert body["emailStatus"] == "failed"

    def test_db_failure_returns_500(self, client) -> None:
        with (
            patch(
                "routes.newsletter.get_db_connection",
                side_effect=Exception("db down"),
            ),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.newsletter.verify_captcha", new_callable=AsyncMock, return_value=True),
        ):
            resp = client.post(
                "/api/newsletter",
                json={"email": VALID_EMAIL, "captchaToken": "tok"},
            )
        assert resp.status_code == 500

    def test_non_duplicate_insert_error_returns_500(self, client) -> None:
        cur = make_async_cursor(execute_side_effect=Exception("connection reset"))
        factory, _ = make_async_db(cur)
        with (
            patch("routes.newsletter.get_db_connection", factory),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.newsletter.verify_captcha", new_callable=AsyncMock, return_value=True),
        ):
            resp = client.post(
                "/api/newsletter",
                json={"email": VALID_EMAIL, "captchaToken": "tok"},
            )
        assert resp.status_code == 500

    def test_validation_invalid_email(self, client) -> None:
        with patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()):
            resp = client.post(
                "/api/newsletter",
                json={"email": "not-an-email", "captchaToken": "tok"},
            )
        assert resp.status_code == 422


class TestUnsubscribeTokens:
    def test_token_is_deterministic(self) -> None:
        t1 = newsletter_module.generate_unsubscribe_token("USER@Example.com")
        t2 = newsletter_module.generate_unsubscribe_token("user@example.com")
        assert t1 == t2

    def test_token_changes_for_different_emails(self) -> None:
        t1 = newsletter_module.generate_unsubscribe_token("a@example.com")
        t2 = newsletter_module.generate_unsubscribe_token("b@example.com")
        assert t1 != t2

    def test_build_url_uses_default_localhost_when_no_env(self, monkeypatch) -> None:
        for key in (
            "NEWSLETTER_UNSUBSCRIBE_BASE_URL",
            "PUBLIC_API_BASE_URL",
            "BACKEND_BASE_URL",
            "VERCEL_URL",
        ):
            monkeypatch.delenv(key, raising=False)
        url = newsletter_module.build_unsubscribe_url(VALID_EMAIL)
        assert url.startswith("http://localhost:8001/api/newsletter/unsubscribe")


class TestUnsubscribeNewsletter:
    def test_success(self, client) -> None:
        cur = make_async_cursor(rowcount=1)
        factory, _ = make_async_db(cur)
        token = newsletter_module.generate_unsubscribe_token(VALID_EMAIL)
        with (
            patch("routes.newsletter.get_db_connection", factory),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.newsletter.send_newsletter_unsubscribe_confirmation", new_callable=AsyncMock),
            patch("routes.newsletter.send_newsletter_unsubscribe_notification", new_callable=AsyncMock),
        ):
            resp = client.get(
                "/api/newsletter/unsubscribe",
                params={"email": VALID_EMAIL, "token": token},
            )
        assert resp.status_code == 200
        assert "text/html" in resp.headers["content-type"].lower()

    def test_missing_token(self, client) -> None:
        with patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()):
            resp = client.get(
                "/api/newsletter/unsubscribe", params={"email": VALID_EMAIL}
            )
        assert resp.status_code == 400

    def test_invalid_token(self, client) -> None:
        with patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()):
            resp = client.get(
                "/api/newsletter/unsubscribe",
                params={"email": VALID_EMAIL, "token": "deadbeef" * 8},
            )
        assert resp.status_code == 400

    def test_rate_limited(self, client) -> None:
        token = newsletter_module.generate_unsubscribe_token(VALID_EMAIL)
        with patch("services.rate_limiter.check_rate_limit", _denied_rate_limit()):
            resp = client.get(
                "/api/newsletter/unsubscribe",
                params={"email": VALID_EMAIL, "token": token},
            )
        assert resp.status_code == 429


class TestSafeBackgroundWrappers:
    @pytest.mark.asyncio
    async def test_safe_send_newsletter_notification_swallows_errors(self) -> None:
        with patch(
            "routes.newsletter.send_newsletter_notification",
            new_callable=AsyncMock,
            side_effect=Exception("boom"),
        ):
            await newsletter_module._safe_send_newsletter_notification(VALID_EMAIL)

    @pytest.mark.asyncio
    async def test_safe_send_newsletter_unsubscribe_notification_swallows_errors(self) -> None:
        with patch(
            "routes.newsletter.send_newsletter_unsubscribe_notification",
            new_callable=AsyncMock,
            side_effect=Exception("boom"),
        ):
            await newsletter_module._safe_send_newsletter_unsubscribe_notification(
                VALID_EMAIL
            )
