from unittest.mock import AsyncMock, patch

from tests.conftest import make_async_cursor, make_async_db, make_unique_violation


def _ok_rate_limit():
    return AsyncMock(return_value=(True, "OK", 0))


def _denied_rate_limit():
    return AsyncMock(return_value=(False, "Too many", 3600))


class TestScheduleEndpoint:
    def test_success(self, client) -> None:
        factory, _ = make_async_db()
        with (
            patch("routes.schedule.get_db_connection", factory),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.schedule.verify_captcha", new_callable=AsyncMock, return_value=True),
            patch("routes.schedule.send_followup", new_callable=AsyncMock),
            patch("routes.schedule.send_schedule_notification", new_callable=AsyncMock),
        ):
            resp = client.post("/api/schedule", json={
                "firstName": "John",
                "lastName": "Doe",
                "phone": "2065551234",
                "email": "john@example.com",
                "message": "Help!",
                "captchaToken": "tok",
            })
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    def test_rate_limited(self, client) -> None:
        with patch("services.rate_limiter.check_rate_limit", _denied_rate_limit()):
            resp = client.post("/api/schedule", json={
                "firstName": "John",
                "lastName": "Doe",
                "phone": "2065551234",
                "email": "john@example.com",
                "captchaToken": "tok",
            })
        assert resp.status_code == 429

    def test_captcha_failed(self, client) -> None:
        with (
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.schedule.verify_captcha", new_callable=AsyncMock, return_value=False),
        ):
            resp = client.post("/api/schedule", json={
                "firstName": "John",
                "lastName": "Doe",
                "phone": "2065551234",
                "email": "john@example.com",
                "captchaToken": "tok",
            })
        assert resp.status_code == 403

    def test_duplicate_request(self, client) -> None:
        cur = make_async_cursor(execute_side_effect=make_unique_violation())
        factory, _ = make_async_db(cur)
        with (
            patch("routes.schedule.get_db_connection", factory),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.schedule.verify_captcha", new_callable=AsyncMock, return_value=True),
        ):
            resp = client.post("/api/schedule", json={
                "firstName": "John",
                "lastName": "Doe",
                "phone": "2065551234",
                "email": "john@example.com",
                "captchaToken": "tok",
            })
        assert resp.status_code == 200
        assert resp.json()["duplicate"] is True

    def test_email_failure_still_succeeds(self, client) -> None:
        from fastapi import HTTPException
        factory, _ = make_async_db()
        with (
            patch("routes.schedule.get_db_connection", factory),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.schedule.verify_captcha", new_callable=AsyncMock, return_value=True),
            patch("routes.schedule.send_followup", new_callable=AsyncMock, side_effect=HTTPException(500, "email err")),
            patch("routes.schedule.send_schedule_notification", new_callable=AsyncMock),
        ):
            resp = client.post("/api/schedule", json={
                "firstName": "John",
                "lastName": "Doe",
                "phone": "2065551234",
                "email": "john@example.com",
                "captchaToken": "tok",
            })
        assert resp.status_code == 200
        assert resp.json()["emailStatus"] == "failed"

    def test_validation_error(self, client) -> None:
        with patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()):
            resp = client.post("/api/schedule", json={
                "firstName": "",
                "lastName": "",
                "phone": "12",
                "email": "bad",
            })
        assert resp.status_code == 422
