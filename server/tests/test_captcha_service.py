from unittest.mock import patch, MagicMock
import requests as req_lib


class TestVerifyCaptchaService:
    def test_success(self):
        mock_resp = MagicMock()
        mock_resp.json.return_value = {"success": True}
        mock_resp.raise_for_status = MagicMock()
        with (
            patch("services.captcha_service.HCAPTCHA_SECRET_KEY", "secret"),
            patch("services.captcha_service.requests.post", return_value=mock_resp),
        ):
            from services.captcha_service import verify_captcha
            assert verify_captcha("valid-token") is True

    def test_failure(self):
        mock_resp = MagicMock()
        mock_resp.json.return_value = {"success": False}
        mock_resp.raise_for_status = MagicMock()
        with (
            patch("services.captcha_service.HCAPTCHA_SECRET_KEY", "secret"),
            patch("services.captcha_service.requests.post", return_value=mock_resp),
        ):
            from services.captcha_service import verify_captcha
            assert verify_captcha("bad-token") is False

    def test_no_token(self):
        with patch("services.captcha_service.HCAPTCHA_SECRET_KEY", "secret"):
            from services.captcha_service import verify_captcha
            assert verify_captcha(None) is False

    def test_no_secret_key_with_bypass(self):
        with (
            patch("services.captcha_service.HCAPTCHA_SECRET_KEY", None),
            patch("services.captcha_service.ALLOW_CAPTCHA_BYPASS", True),
        ):
            from services.captcha_service import verify_captcha
            assert verify_captcha("tok") is True

    def test_no_secret_key_without_bypass(self):
        with (
            patch("services.captcha_service.HCAPTCHA_SECRET_KEY", None),
            patch("services.captcha_service.ALLOW_CAPTCHA_BYPASS", False),
        ):
            from services.captcha_service import verify_captcha
            assert verify_captcha("tok") is False

    def test_request_exception(self):
        with (
            patch("services.captcha_service.HCAPTCHA_SECRET_KEY", "secret"),
            patch("services.captcha_service.requests.post", side_effect=Exception("net err")),
        ):
            from services.captcha_service import verify_captcha
            assert verify_captcha("tok") is False
