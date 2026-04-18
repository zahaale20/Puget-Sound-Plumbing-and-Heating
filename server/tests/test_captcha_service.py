from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest


def _async_response(json_data):
    resp = MagicMock(spec=httpx.Response)
    resp.json.return_value = json_data
    resp.raise_for_status = MagicMock()
    return resp


class TestVerifyCaptchaService:
    @pytest.mark.asyncio
    async def test_success(self) -> None:
        with (
            patch("services.captcha_service._secret", return_value="secret"),
            patch(
                "services.captcha_service.httpx.AsyncClient.post",
                new=AsyncMock(return_value=_async_response({"success": True})),
            ),
        ):
            from services.captcha_service import verify_captcha
            assert await verify_captcha("valid-token") is True

    @pytest.mark.asyncio
    async def test_failure(self) -> None:
        with (
            patch("services.captcha_service._secret", return_value="secret"),
            patch(
                "services.captcha_service.httpx.AsyncClient.post",
                new=AsyncMock(
                    return_value=_async_response(
                        {"success": False, "error-codes": ["invalid-input-response"]}
                    )
                ),
            ),
        ):
            from services.captcha_service import verify_captcha
            assert await verify_captcha("bad-token") is False

    @pytest.mark.asyncio
    async def test_no_token(self) -> None:
        with patch("services.captcha_service._secret", return_value="secret"):
            from services.captcha_service import verify_captcha
            assert await verify_captcha(None) is False

    @pytest.mark.asyncio
    async def test_no_secret_key_with_bypass(self) -> None:
        with (
            patch("services.captcha_service._secret", return_value=None),
            patch("services.captcha_service._bypass_enabled", return_value=True),
        ):
            from services.captcha_service import verify_captcha
            assert await verify_captcha("tok") is True

    @pytest.mark.asyncio
    async def test_no_secret_key_without_bypass(self) -> None:
        with (
            patch("services.captcha_service._secret", return_value=None),
            patch("services.captcha_service._bypass_enabled", return_value=False),
        ):
            from services.captcha_service import verify_captcha
            assert await verify_captcha("tok") is False

    @pytest.mark.asyncio
    async def test_request_exception(self) -> None:
        with (
            patch("services.captcha_service._secret", return_value="secret"),
            patch(
                "services.captcha_service.httpx.AsyncClient.post",
                new=AsyncMock(side_effect=httpx.RequestError("net err")),
            ),
        ):
            from services.captcha_service import verify_captcha
            assert await verify_captcha("tok") is False

    @pytest.mark.asyncio
    async def test_request_exception_retries_before_failing(self) -> None:
        with (
            patch("services.captcha_service._secret", return_value="secret"),
            patch("services.captcha_service.HCAPTCHA_MAX_ATTEMPTS", 3),
            patch("services.captcha_service.HCAPTCHA_RETRY_BACKOFF_SEC", 0),
            patch("services.captcha_service.HCAPTCHA_MAX_BACKOFF_SEC", 0),
            patch(
                "services.captcha_service.httpx.AsyncClient.post",
                new=AsyncMock(side_effect=httpx.RequestError("net err")),
            ) as mock_post,
        ):
            from services.captcha_service import verify_captcha

            assert await verify_captcha("tok") is False
            assert mock_post.await_count == 3

    @pytest.mark.asyncio
    async def test_detailed_result_carries_error_codes(self) -> None:
        with (
            patch("services.captcha_service._secret", return_value="secret"),
            patch(
                "services.captcha_service.httpx.AsyncClient.post",
                new=AsyncMock(
                    return_value=_async_response(
                        {"success": False, "error-codes": ["sitekey-secret-mismatch"]}
                    )
                ),
            ),
        ):
            from services.captcha_service import verify_captcha_detailed
            result = await verify_captcha_detailed("tok")
            assert result.success is False
            assert result.reason == "rejected"
            assert "sitekey-secret-mismatch" in result.error_codes
