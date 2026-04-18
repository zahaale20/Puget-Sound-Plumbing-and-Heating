from unittest.mock import AsyncMock, MagicMock, patch

import httpx


def _ok_rate_limit():
    return AsyncMock(return_value=(True, "OK", 0))


def _denied_rate_limit():
    return AsyncMock(return_value=(False, "Limited", 3600))


def _async_response(json_data):
    resp = MagicMock(spec=httpx.Response)
    resp.json.return_value = json_data
    resp.raise_for_status = MagicMock()
    return resp


class TestVerifyCaptchaRoute:
    def test_success(self, client) -> None:
        with (
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("services.captcha_service._secret", return_value="secret"),
            patch(
                "services.captcha_service.httpx.AsyncClient.post",
                new=AsyncMock(return_value=_async_response({"success": True})),
            ),
        ):
            resp = client.post("/api/verify-captcha", json={"token": "valid"})
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    def test_missing_token(self, client) -> None:
        with patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()):
            resp = client.post("/api/verify-captcha", json={})
        # Pydantic model validation -> 422
        assert resp.status_code in (400, 422)

    def test_no_secret_key_with_dev_bypass_succeeds(self, client) -> None:
        with (
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("services.captcha_service._secret", return_value=None),
            patch("services.captcha_service._bypass_enabled", return_value=True),
        ):
            resp = client.post("/api/verify-captcha", json={"token": "tok"})
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    def test_no_secret_key_without_bypass_500s(self, client) -> None:
        with (
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("services.captcha_service._secret", return_value=None),
            patch("services.captcha_service._bypass_enabled", return_value=False),
        ):
            resp = client.post("/api/verify-captcha", json={"token": "tok"})
        assert resp.status_code == 500

    def test_failed_verification(self, client) -> None:
        with (
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("services.captcha_service._secret", return_value="secret"),
            patch(
                "services.captcha_service.httpx.AsyncClient.post",
                new=AsyncMock(return_value=_async_response({"success": False})),
            ),
        ):
            resp = client.post("/api/verify-captcha", json={"token": "invalid"})
        assert resp.status_code == 403

    def test_rate_limited(self, client) -> None:
        with patch("services.rate_limiter.check_rate_limit", _denied_rate_limit()):
            resp = client.post("/api/verify-captcha", json={"token": "tok"})
        assert resp.status_code == 429

    def test_api_error(self, client) -> None:
        with (
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("services.captcha_service._secret", return_value="secret"),
            patch(
                "services.captcha_service.httpx.AsyncClient.post",
                new=AsyncMock(side_effect=httpx.RequestError("timeout")),
            ),
        ):
            resp = client.post("/api/verify-captcha", json={"token": "tok"})
        assert resp.status_code == 502

    # --- schema enforcement (CaptchaVerifyRequest) -----------------------

    def test_extra_fields_rejected(self, client) -> None:
        with patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()):
            resp = client.post(
                "/api/verify-captcha",
                json={"token": "tok", "evil": "payload"},
            )
        assert resp.status_code == 422

    def test_token_wrong_type_rejected(self, client) -> None:
        with patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()):
            resp = client.post("/api/verify-captcha", json={"token": 123})
        assert resp.status_code == 422

    def test_token_too_long_rejected(self, client) -> None:
        with patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()):
            resp = client.post(
                "/api/verify-captcha",
                json={"token": "a" * 4097},
            )
        assert resp.status_code == 422

    def test_empty_token_rejected_by_schema(self, client) -> None:
        # min_length=1 — explicit empty string is a schema violation, not a
        # business-logic "missing token" 400.
        with patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()):
            resp = client.post("/api/verify-captcha", json={"token": ""})
        assert resp.status_code == 422

    def test_non_object_body_rejected(self, client) -> None:
        with patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()):
            resp = client.post("/api/verify-captcha", json="not-an-object")
        assert resp.status_code == 422
