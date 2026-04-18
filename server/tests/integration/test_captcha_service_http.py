"""Real-httpx tests for `services/captcha_service.py`.

The unit suite patches `routes.<x>.verify_captcha` with `AsyncMock` —
the module under test is never actually invoked. That means:

- the hCaptcha siteverify URL, payload shape, and timeout are unverified
- the bypass branch and the missing-secret-without-bypass branch can
  diverge from production behaviour silently
- a network error is never simulated through the real `httpx.AsyncClient`

These tests use `httpx.MockTransport` to intercept the *real* outbound
request inside `verify_captcha_detailed`, which is the right place to
mock — the third-party HTTP boundary, not the in-process function.
"""

from __future__ import annotations

import httpx
import pytest

from services import captcha_service

pytestmark = [pytest.mark.asyncio, pytest.mark.integration]


@pytest.fixture()
def mock_hcaptcha(monkeypatch):
    """Replace httpx.AsyncClient with one wired to a MockTransport.

    Returns a list that captures every intercepted request so tests can
    assert on the URL and payload. The handler is configurable via the
    `set_handler` attribute.
    """
    captured: list[httpx.Request] = []
    handler = {"fn": lambda req: httpx.Response(200, json={"success": True})}

    def transport_handler(request: httpx.Request) -> httpx.Response:
        captured.append(request)
        return handler["fn"](request)

    transport = httpx.MockTransport(transport_handler)

    real_async_client = httpx.AsyncClient

    def patched_client(*args, **kwargs):
        kwargs["transport"] = transport
        return real_async_client(*args, **kwargs)

    monkeypatch.setattr(captcha_service.httpx, "AsyncClient", patched_client)
    monkeypatch.setenv("HCAPTCHA_SECRET_KEY", "test-secret")
    monkeypatch.setenv("ALLOW_CAPTCHA_BYPASS", "false")

    class _Ctrl:
        requests = captured

        @staticmethod
        def set_handler(fn) -> None:
            handler["fn"] = fn

    return _Ctrl()


async def test_missing_token_returns_missing_token_reason() -> None:
    result = await captcha_service.verify_captcha_detailed(None)
    assert result.success is False
    assert result.reason == "missing_token"


async def test_missing_secret_with_bypass_returns_success(monkeypatch) -> None:
    monkeypatch.delenv("HCAPTCHA_SECRET_KEY", raising=False)
    monkeypatch.setenv("ALLOW_CAPTCHA_BYPASS", "true")
    result = await captcha_service.verify_captcha_detailed("anything")
    assert result.success is True
    assert result.reason == "missing_secret"


async def test_missing_secret_without_bypass_denies(monkeypatch) -> None:
    monkeypatch.delenv("HCAPTCHA_SECRET_KEY", raising=False)
    monkeypatch.setenv("ALLOW_CAPTCHA_BYPASS", "false")
    result = await captcha_service.verify_captcha_detailed("anything")
    assert result.success is False
    assert result.reason == "missing_secret"


async def test_success_path_hits_real_siteverify_url(mock_hcaptcha) -> None:
    result = await captcha_service.verify_captcha_detailed("good-token")
    assert result.success is True
    assert result.reason == "ok"

    assert len(mock_hcaptcha.requests) == 1
    sent = mock_hcaptcha.requests[0]
    assert str(sent.url) == captcha_service.HCAPTCHA_VERIFY_URL
    body = dict(httpx.QueryParams(sent.content.decode()))
    assert body == {"secret": "test-secret", "response": "good-token"}


async def test_rejected_token_surfaces_error_codes(mock_hcaptcha) -> None:
    mock_hcaptcha.set_handler(
        lambda req: httpx.Response(
            200,
            json={"success": False, "error-codes": ["invalid-input-response"]},
        )
    )
    result = await captcha_service.verify_captcha_detailed("bad-token")
    assert result.success is False
    assert result.reason == "rejected"
    assert result.error_codes == ("invalid-input-response",)


async def test_network_error_is_caught(mock_hcaptcha) -> None:
    mock_hcaptcha.set_handler(
        lambda req: (_ for _ in ()).throw(httpx.ConnectError("boom"))
    )
    result = await captcha_service.verify_captcha_detailed("any-token")
    assert result.success is False
    assert result.reason == "network_error"


async def test_verify_captcha_boolean_wrapper(mock_hcaptcha) -> None:
    assert await captcha_service.verify_captcha("good-token") is True
    mock_hcaptcha.set_handler(
        lambda req: httpx.Response(200, json={"success": False})
    )
    assert await captcha_service.verify_captcha("bad-token") is False
