from unittest.mock import AsyncMock, patch

import pytest

from services.email_service import (
    _contact,
    _coupon_card,
    _cta,
    _customer_footer,
    _data_table,
    _esc,
    _heading,
    _logo,
    _notif_footer,
    _safe_addr,
    _safe_hdr,
    _send,
    _send_notification,
    _steps,
    _wrap,
    send_coupon_confirmation,
    send_coupon_notification,
    send_diy_permit_confirmation,
    send_diy_permit_notification,
    send_followup,
    send_job_application_confirmation,
    send_job_application_notification,
    send_newsletter_confirmation,
    send_newsletter_notification,
    send_newsletter_unsubscribe_confirmation,
    send_newsletter_unsubscribe_notification,
    send_schedule_notification,
)


class TestSanitizationHelpers:
    def test_safe_addr(self) -> None:
        assert _safe_addr("  User@Example.COM  ") == "user@example.com"

    def test_safe_addr_strips_newlines(self) -> None:
        assert _safe_addr("user@test.com\r\n") == "user@test.com"

    def test_safe_hdr_strips_newlines(self) -> None:
        assert _safe_hdr("Hello\r\nWorld") == "Hello World"

    def test_safe_hdr_none(self) -> None:
        assert _safe_hdr(None) == ""  # type: ignore[arg-type]

    def test_esc_html(self) -> None:
        assert _esc('<script>alert("xss")</script>') == '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'

    def test_esc_none(self) -> None:
        assert _esc(None) == ""  # type: ignore[arg-type]


class TestTemplateBlocks:
    def test_logo_contains_img(self) -> None:
        html = _logo()
        assert "<img" in html
        assert "pspah-logo.png" in html

    def test_heading_with_description(self) -> None:
        html = _heading("Title", "Desc")
        assert "Title" in html
        assert "Desc" in html

    def test_heading_without_description(self) -> None:
        html = _heading("Title")
        assert "Title" in html

    def test_steps_numbered(self) -> None:
        html = _steps("Next", ["Step A", "Step B"])
        assert "1." in html
        assert "2." in html
        assert "Step A" in html
        assert "Step B" in html

    def test_contact_default(self) -> None:
        html = _contact()
        assert "24 hours" in html

    def test_contact_custom(self) -> None:
        html = _contact("Custom text")
        assert "Custom text" in html

    def test_cta_default(self) -> None:
        html = _cta()
        assert "CALL" in html

    def test_cta_custom(self) -> None:
        html = _cta("Click Me", "https://example.com")
        assert "Click Me" in html
        assert "https://example.com" in html

    def test_data_table(self) -> None:
        html = _data_table([("Name", "John"), ("Email", "john@test.com")])
        assert "Name" in html
        assert "John" in html

    def test_wrap_produces_html(self) -> None:
        html = _wrap("<tr><td>Content</td></tr>", "<tr><td>Footer</td></tr>")
        assert "<!DOCTYPE html>" in html
        assert "Content" in html
        assert "Footer" in html

    def test_customer_footer(self) -> None:
        html = _customer_footer("Note text")
        assert "Note text" in html
        assert "Puget Sound" in html

    def test_customer_footer_with_unsub(self) -> None:
        html = _customer_footer("Note", unsubscribe_url="https://unsub.com")
        assert "Unsubscribe" in html

    def test_notif_footer(self) -> None:
        html = _notif_footer("Internal Label")
        assert "Internal Label" in html

    def test_coupon_card(self) -> None:
        html = _coupon_card("PSPAH-123-abc", "$50 Off", "Any service")
        assert "PSPAH-123-abc" in html
        assert "$50 Off" in html


class TestSendFunctions:
    @pytest.mark.asyncio
    @patch("services.email_service.resend")
    async def test_send_followup(self, mock_resend) -> None:
        await send_followup("user@test.com", "John")
        mock_resend.Emails.send.assert_called_once()
        call_args = mock_resend.Emails.send.call_args[0][0]
        assert call_args["to"] == "user@test.com"
        assert "Thank You" in call_args["html"]

    @pytest.mark.asyncio
    @patch("services.email_service.resend")
    async def test_send_newsletter_confirmation(self, mock_resend) -> None:
        await send_newsletter_confirmation("user@test.com", "https://unsub.com")
        mock_resend.Emails.send.assert_called_once()

    @pytest.mark.asyncio
    @patch("services.email_service.resend")
    async def test_send_newsletter_unsubscribe_confirmation(self, mock_resend) -> None:
        await send_newsletter_unsubscribe_confirmation("user@test.com")
        mock_resend.Emails.send.assert_called_once()

    @pytest.mark.asyncio
    @patch("services.email_service.resend")
    async def test_send_coupon_confirmation(self, mock_resend) -> None:
        await send_coupon_confirmation(
            "user@test.com", "John", "PSPAH-1-abc", "$50 OFF", "Any service"
        )
        mock_resend.Emails.send.assert_called_once()

    @pytest.mark.asyncio
    @patch("services.email_service.resend")
    async def test_send_diy_permit_confirmation(self, mock_resend) -> None:
        await send_diy_permit_confirmation("user@test.com", "John", "123 Main St")
        mock_resend.Emails.send.assert_called_once()

    @pytest.mark.asyncio
    @patch("services.email_service.resend")
    async def test_send_job_application_confirmation(self, mock_resend) -> None:
        await send_job_application_confirmation("user@test.com", "John", "Plumber")
        mock_resend.Emails.send.assert_called_once()


class TestNotificationFunctions:
    @pytest.mark.asyncio
    async def test_send_notification_requires_company_email(self) -> None:
        with patch("services.email_service.COMPANY_EMAIL", ""):
            with pytest.raises(RuntimeError):
                await _send_notification(
                    subject="s",
                    title="t",
                    rows=[("Name", "John")],
                    label="lbl",
                )

    @pytest.mark.asyncio
    async def test_send_schedule_notification_swallow_errors(self) -> None:
        with patch("services.email_service._send_notification", new_callable=AsyncMock, side_effect=Exception("boom")):
            await send_schedule_notification("u@test.com", "A", "B", "123", "hello")

    @pytest.mark.asyncio
    async def test_send_newsletter_notification_swallow_errors(self) -> None:
        with patch("services.email_service._send_notification", new_callable=AsyncMock, side_effect=Exception("boom")):
            await send_newsletter_notification("u@test.com")

    @pytest.mark.asyncio
    async def test_send_newsletter_unsubscribe_notification(self) -> None:
        with patch("services.email_service._send", new_callable=AsyncMock) as mock_send:
            await send_newsletter_unsubscribe_notification("u@test.com")
            mock_send.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_send_coupon_notification(self) -> None:
        with patch("services.email_service._send_notification", new_callable=AsyncMock) as mock_send:
            await send_coupon_notification(
                "u@test.com", "A", "B", "206", "PSPAH-1-abc", "$20 OFF", "Any service"
            )
            mock_send.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_send_diy_permit_notification(self) -> None:
        with patch("services.email_service._send_notification", new_callable=AsyncMock) as mock_send:
            await send_diy_permit_notification(
                "u@test.com", "A", "B", "206", "123 Main", "Seattle", "WA", "98101", "desc", "yes"
            )
            mock_send.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_send_job_application_notification_with_attachment(self) -> None:
        with patch("services.email_service._send", new_callable=AsyncMock) as mock_send:
            await send_job_application_notification(
                "u@test.com", "A", "B", "Plumber", b"pdfbytes", "resume.pdf"
            )
            mock_send.assert_awaited_once()
            assert mock_send.await_args is not None
            kwargs = mock_send.await_args.kwargs
            assert kwargs["attachments"][0]["filename"] == "resume.pdf"

    @pytest.mark.asyncio
    async def test_send_job_application_notification_without_attachment(self) -> None:
        with patch("services.email_service._send", new_callable=AsyncMock) as mock_send:
            await send_job_application_notification(
                "u@test.com", "A", "B", "Plumber", None, None
            )
            mock_send.assert_awaited_once()
            assert mock_send.await_args is not None
            kwargs = mock_send.await_args.kwargs
            assert kwargs["attachments"] is None


class TestSendPrimitive:
    @pytest.mark.asyncio
    @patch("services.email_service.asyncio.to_thread", new_callable=AsyncMock)
    async def test_send_includes_attachments(self, mock_to_thread) -> None:
        await _send(
            to="u@test.com",
            subject="sub",
            html="<p>x</p>",
            attachments=[{"filename": "a.txt", "content": "YQ=="}],
        )
        assert mock_to_thread.await_count == 1

    @pytest.mark.asyncio
    @patch("services.email_service.asyncio.to_thread", new_callable=AsyncMock)
    async def test_send_retries_timeout(self, mock_to_thread):
        call_count = {"n": 0}

        async def _flaky(*args, **kwargs):
            call_count["n"] += 1
            if call_count["n"] < 3:
                raise TimeoutError("timeout")
            return None

        mock_to_thread.side_effect = _flaky

        with (
            patch("services.email_service.RESEND_MAX_ATTEMPTS", 3),
            patch("services.email_service.RESEND_RETRY_BACKOFF_SEC", 0),
            patch("services.email_service.RESEND_MAX_BACKOFF_SEC", 0),
            patch("services.email_service.RESEND_TIMEOUT_SEC", 1),
        ):
            await _send(to="u@test.com", subject="sub", html="<p>x</p>")

        assert mock_to_thread.await_count == 3

    @pytest.mark.asyncio
    async def test_send_fails_fast_when_circuit_open(self) -> None:
        with patch("services.email_service._resend_breaker.allow_request", return_value=False):
            with pytest.raises(RuntimeError, match="circuit open"):
                await _send(to="u@test.com", subject="sub", html="<p>x</p>")
