from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from tests.conftest import make_async_cursor, make_async_db, make_unique_violation


def _ok_rate_limit():
    return AsyncMock(return_value=(True, "OK", 0))


def _denied_rate_limit():
    return AsyncMock(return_value=(False, "Too many", 3600))


class TestDiyPermitRoute:
    def _payload(self):
        return {
            "firstName": "Jane",
            "lastName": "Doe",
            "email": "jane@example.com",
            "phone": "2065559999",
            "address": "123 Main St",
            "city": "Seattle",
            "state": "WA",
            "zipCode": "98101",
            "projectDescription": "Install water heater",
            "inspection": "yes",
            "captchaToken": "tok",
        }

    def test_success(self, client) -> None:
        factory, _ = make_async_db()
        with (
            patch("routes.diy_permit.get_db_connection", factory),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.diy_permit.verify_captcha", new_callable=AsyncMock, return_value=True),
            patch("routes.diy_permit.send_diy_permit_confirmation", new_callable=AsyncMock),
            patch("routes.diy_permit.send_diy_permit_notification", new_callable=AsyncMock),
        ):
            resp = client.post("/api/diy-permit", json=self._payload())
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    def test_rate_limited(self, client) -> None:
        with patch("services.rate_limiter.check_rate_limit", _denied_rate_limit()):
            resp = client.post("/api/diy-permit", json=self._payload())
        assert resp.status_code == 429

    def test_captcha_failed(self, client) -> None:
        with (
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.diy_permit.verify_captcha", new_callable=AsyncMock, return_value=False),
        ):
            resp = client.post("/api/diy-permit", json=self._payload())
        assert resp.status_code == 403

    def test_duplicate(self, client) -> None:
        cur = make_async_cursor(execute_side_effect=make_unique_violation())
        factory, _ = make_async_db(cur)
        with (
            patch("routes.diy_permit.get_db_connection", factory),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.diy_permit.verify_captcha", new_callable=AsyncMock, return_value=True),
        ):
            resp = client.post("/api/diy-permit", json=self._payload())
        assert resp.status_code == 200
        assert resp.json()["duplicate"] is True

    def test_email_failure_returns_failed_status(self, client) -> None:
        factory, _ = make_async_db()
        with (
            patch("routes.diy_permit.get_db_connection", factory),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.diy_permit.verify_captcha", new_callable=AsyncMock, return_value=True),
            patch(
                "routes.diy_permit.send_diy_permit_confirmation",
                new_callable=AsyncMock,
                side_effect=HTTPException(500, "email err"),
            ),
        ):
            resp = client.post("/api/diy-permit", json=self._payload())
        assert resp.status_code == 200
        assert resp.json()["emailStatus"] == "failed"

    def test_invalid_inspection_validation(self, client) -> None:
        payload = self._payload()
        payload["inspection"] = "maybe"
        with patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()):
            resp = client.post("/api/diy-permit", json=payload)
        assert resp.status_code == 422

    def test_db_failure_returns_500(self, client) -> None:
        with (
            patch("routes.diy_permit.get_db_connection", side_effect=Exception("db down")),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.diy_permit.verify_captcha", new_callable=AsyncMock, return_value=True),
        ):
            resp = client.post("/api/diy-permit", json=self._payload())
        assert resp.status_code == 500
