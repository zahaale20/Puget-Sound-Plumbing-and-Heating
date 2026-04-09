from unittest.mock import patch, MagicMock


class TestVerifyCaptcha:
    def test_success(self, client):
        mock_resp = MagicMock()
        mock_resp.json.return_value = {"success": True}
        mock_resp.raise_for_status = MagicMock()
        with (
            patch("routes.captcha.check_rate_limit", return_value=(True, "OK")),
            patch("routes.captcha.HCAPTCHA_SECRET_KEY", "secret"),
            patch("routes.captcha.requests.post", return_value=mock_resp),
        ):
            resp = client.post("/api/verify-captcha", json={"token": "valid"})
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    def test_missing_token(self, client):
        with patch("routes.captcha.check_rate_limit", return_value=(True, "OK")):
            resp = client.post("/api/verify-captcha", json={})
        assert resp.status_code == 400

    def test_no_secret_key_allows(self, client):
        with (
            patch("routes.captcha.check_rate_limit", return_value=(True, "OK")),
            patch("routes.captcha.HCAPTCHA_SECRET_KEY", None),
        ):
            resp = client.post("/api/verify-captcha", json={"token": "tok"})
        assert resp.status_code == 200

    def test_failed_verification(self, client):
        mock_resp = MagicMock()
        mock_resp.json.return_value = {"success": False}
        mock_resp.raise_for_status = MagicMock()
        with (
            patch("routes.captcha.check_rate_limit", return_value=(True, "OK")),
            patch("routes.captcha.HCAPTCHA_SECRET_KEY", "secret"),
            patch("routes.captcha.requests.post", return_value=mock_resp),
        ):
            resp = client.post("/api/verify-captcha", json={"token": "invalid"})
        assert resp.status_code == 403

    def test_rate_limited(self, client):
        with patch("routes.captcha.check_rate_limit", return_value=(False, "Limited")):
            resp = client.post("/api/verify-captcha", json={"token": "tok"})
        assert resp.status_code == 429

    def test_api_error(self, client):
        import requests as req_lib
        with (
            patch("routes.captcha.check_rate_limit", return_value=(True, "OK")),
            patch("routes.captcha.HCAPTCHA_SECRET_KEY", "secret"),
            patch("routes.captcha.requests.post", side_effect=req_lib.RequestException("timeout")),
        ):
            resp = client.post("/api/verify-captcha", json={"token": "tok"})
        assert resp.status_code == 500
