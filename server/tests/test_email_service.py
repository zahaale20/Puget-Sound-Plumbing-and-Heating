from unittest.mock import patch, MagicMock
from services.email_service import (
    _safe_addr,
    _safe_hdr,
    _esc,
    _logo,
    _heading,
    _steps,
    _contact,
    _cta,
    _data_table,
    _wrap,
    _customer_footer,
    _notif_footer,
    _coupon_card,
    send_followup,
    send_newsletter_confirmation,
    send_newsletter_unsubscribe_confirmation,
)


class TestSanitizationHelpers:
    def test_safe_addr(self):
        assert _safe_addr("  User@Example.COM  ") == "user@example.com"

    def test_safe_addr_strips_newlines(self):
        assert _safe_addr("user@test.com\r\n") == "user@test.com"

    def test_safe_hdr_strips_newlines(self):
        assert _safe_hdr("Hello\r\nWorld") == "Hello World"

    def test_safe_hdr_none(self):
        assert _safe_hdr(None) == ""

    def test_esc_html(self):
        assert _esc('<script>alert("xss")</script>') == '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'

    def test_esc_none(self):
        assert _esc(None) == ""


class TestTemplateBlocks:
    def test_logo_contains_img(self):
        html = _logo()
        assert "<img" in html
        assert "pspah-logo.png" in html

    def test_heading_with_description(self):
        html = _heading("Title", "Desc")
        assert "Title" in html
        assert "Desc" in html

    def test_heading_without_description(self):
        html = _heading("Title")
        assert "Title" in html

    def test_steps_numbered(self):
        html = _steps("Next", ["Step A", "Step B"])
        assert "1." in html
        assert "2." in html
        assert "Step A" in html
        assert "Step B" in html

    def test_contact_default(self):
        html = _contact()
        assert "24 hours" in html

    def test_contact_custom(self):
        html = _contact("Custom text")
        assert "Custom text" in html

    def test_cta_default(self):
        html = _cta()
        assert "CALL" in html

    def test_cta_custom(self):
        html = _cta("Click Me", "https://example.com")
        assert "Click Me" in html
        assert "https://example.com" in html

    def test_data_table(self):
        html = _data_table([("Name", "John"), ("Email", "john@test.com")])
        assert "Name" in html
        assert "John" in html

    def test_wrap_produces_html(self):
        html = _wrap("<tr><td>Content</td></tr>", "<tr><td>Footer</td></tr>")
        assert "<!DOCTYPE html>" in html
        assert "Content" in html
        assert "Footer" in html

    def test_customer_footer(self):
        html = _customer_footer("Note text")
        assert "Note text" in html
        assert "Puget Sound" in html

    def test_customer_footer_with_unsub(self):
        html = _customer_footer("Note", unsubscribe_url="https://unsub.com")
        assert "Unsubscribe" in html

    def test_notif_footer(self):
        html = _notif_footer("Internal Label")
        assert "Internal Label" in html

    def test_coupon_card(self):
        html = _coupon_card("PSPAH-123-abc", "$50 Off", "Any service")
        assert "PSPAH-123-abc" in html
        assert "$50 Off" in html


class TestSendFunctions:
    @patch("services.email_service.resend")
    def test_send_followup(self, mock_resend):
        send_followup("user@test.com", "John")
        mock_resend.Emails.send.assert_called_once()
        call_args = mock_resend.Emails.send.call_args[0][0]
        assert call_args["to"] == "user@test.com"
        assert "Thank You" in call_args["html"]

    @patch("services.email_service.resend")
    def test_send_newsletter_confirmation(self, mock_resend):
        send_newsletter_confirmation("user@test.com", "https://unsub.com")
        mock_resend.Emails.send.assert_called_once()

    @patch("services.email_service.resend")
    def test_send_newsletter_unsubscribe_confirmation(self, mock_resend):
        send_newsletter_unsubscribe_confirmation("user@test.com")
        mock_resend.Emails.send.assert_called_once()
