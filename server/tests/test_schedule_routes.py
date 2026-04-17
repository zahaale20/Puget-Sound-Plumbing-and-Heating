from unittest.mock import patch, MagicMock
from contextlib import contextmanager


def _mock_db_ctx(mock_cursor):
    mock_conn = MagicMock()
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    @contextmanager
    def _ctx():
        yield mock_conn

    return _ctx


class TestScheduleEndpoint:
    def test_success(self, client):
        mock_cursor = MagicMock()
        with (
            patch("routes.schedule.get_db_connection", _mock_db_ctx(mock_cursor)),
            patch("services.rate_limiter.check_rate_limit", return_value=(True, "OK", 0)),
            patch("routes.schedule.verify_captcha", return_value=True),
            patch("routes.schedule.send_followup"),
            patch("routes.schedule.send_schedule_notification"),
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

    def test_rate_limited(self, client):
        with patch("services.rate_limiter.check_rate_limit", return_value=(False, "Too many", 3600)):
            resp = client.post("/api/schedule", json={
                "firstName": "John",
                "lastName": "Doe",
                "phone": "2065551234",
                "email": "john@example.com",
                "captchaToken": "tok",
            })
        assert resp.status_code == 429

    def test_captcha_failed(self, client):
        with (
            patch("services.rate_limiter.check_rate_limit", return_value=(True, "OK", 0)),
            patch("routes.schedule.verify_captcha", return_value=False),
        ):
            resp = client.post("/api/schedule", json={
                "firstName": "John",
                "lastName": "Doe",
                "phone": "2065551234",
                "email": "john@example.com",
                "captchaToken": "tok",
            })
        assert resp.status_code == 403

    def test_duplicate_request(self, client):
        mock_cursor = MagicMock()
        mock_cursor.execute.side_effect = Exception("unique constraint violated")
        with (
            patch("routes.schedule.get_db_connection", _mock_db_ctx(mock_cursor)),
            patch("services.rate_limiter.check_rate_limit", return_value=(True, "OK", 0)),
            patch("routes.schedule.verify_captcha", return_value=True),
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

    def test_email_failure_still_succeeds(self, client):
        from fastapi import HTTPException
        mock_cursor = MagicMock()
        with (
            patch("routes.schedule.get_db_connection", _mock_db_ctx(mock_cursor)),
            patch("services.rate_limiter.check_rate_limit", return_value=(True, "OK", 0)),
            patch("routes.schedule.verify_captcha", return_value=True),
            patch("routes.schedule.send_followup", side_effect=HTTPException(500, "email err")),
            patch("routes.schedule.send_schedule_notification"),
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

    def test_validation_error(self, client):
        with patch("services.rate_limiter.check_rate_limit", return_value=(True, "OK", 0)):
            resp = client.post("/api/schedule", json={
                "firstName": "",
                "lastName": "",
                "phone": "12",
                "email": "bad",
            })
        assert resp.status_code == 422
