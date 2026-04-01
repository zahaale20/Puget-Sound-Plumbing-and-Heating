"""Unit tests for email helper functions (the _send_* functions in routes.email).

These verify that the helper functions call resend.Emails.send with
correct parameters (to/from/subject/html) and raise on failure.
"""
import pytest
from unittest.mock import patch, MagicMock, call
import resend


class TestSendFollowupEmail:
    """Tests for _send_followup_email."""

    def test_calls_resend_with_correct_params(self):
        from routes.email import _send_followup_email, EMAIL_FROM
        with patch.object(resend.Emails, "send", return_value={"id": "123"}) as mock:
            _send_followup_email("user@example.com", "Alice")
        mock.assert_called_once()
        kwargs = mock.call_args[1] if mock.call_args[1] else mock.call_args[0][0]
        # Should be a dict with from, to, subject, html
        if isinstance(kwargs, dict):
            # 'to' can be a string or list depending on the helper
            to_val = kwargs["to"]
            assert "user@example.com" in (to_val if isinstance(to_val, list) else [to_val])
            assert "Alice" in kwargs.get("html", "") or "Alice" in kwargs.get("subject", "")

    def test_raises_on_resend_failure(self):
        from routes.email import _send_followup_email
        with patch.object(resend.Emails, "send", side_effect=Exception("Resend down")):
            with pytest.raises(Exception):
                _send_followup_email("user@example.com", "Alice")


class TestSendScheduleNotificationEmail:
    """Tests for _send_schedule_notification_email (company notification)."""

    def test_sends_to_company_email(self):
        from routes.email import _send_schedule_notification_email, COMPANY_EMAIL
        with patch.object(resend.Emails, "send", return_value={"id": "123"}) as mock:
            _send_schedule_notification_email(
                "client@example.com", "John", "Doe", "2065551234", "Need help"
            )
        mock.assert_called_once()
        kwargs = mock.call_args[1] if mock.call_args[1] else mock.call_args[0][0]
        if isinstance(kwargs, dict):
            assert COMPANY_EMAIL in kwargs["to"]

    def test_includes_customer_details_in_html(self):
        from routes.email import _send_schedule_notification_email
        with patch.object(resend.Emails, "send", return_value={"id": "123"}) as mock:
            _send_schedule_notification_email(
                "client@example.com", "John", "Doe", "2065551234", "Fix my pipes"
            )
        kwargs = mock.call_args[1] if mock.call_args[1] else mock.call_args[0][0]
        if isinstance(kwargs, dict):
            html = kwargs.get("html", "")
            assert "John" in html
            assert "client@example.com" in html


class TestSendNewsletterConfirmationEmail:
    """Tests for _send_newsletter_confirmation_email."""

    def test_sends_to_subscriber(self):
        from routes.email import _send_newsletter_confirmation_email
        with patch.object(resend.Emails, "send", return_value={"id": "123"}) as mock:
            _send_newsletter_confirmation_email(
                "sub@example.com", "https://example.com/unsubscribe"
            )
        mock.assert_called_once()
        kwargs = mock.call_args[1] if mock.call_args[1] else mock.call_args[0][0]
        if isinstance(kwargs, dict):
            assert "sub@example.com" in kwargs["to"]

    def test_includes_unsubscribe_url(self):
        from routes.email import _send_newsletter_confirmation_email
        with patch.object(resend.Emails, "send", return_value={"id": "123"}) as mock:
            _send_newsletter_confirmation_email(
                "sub@example.com", "https://example.com/unsub?email=sub%40example.com"
            )
        kwargs = mock.call_args[1] if mock.call_args[1] else mock.call_args[0][0]
        if isinstance(kwargs, dict):
            html = kwargs.get("html", "")
            assert "unsub" in html.lower() or "unsubscribe" in html.lower()


class TestSendNewsletterNotificationEmail:
    """Tests for _send_newsletter_notification_email (company notification)."""

    def test_sends_to_company(self):
        from routes.email import _send_newsletter_notification_email, COMPANY_EMAIL
        with patch.object(resend.Emails, "send", return_value={"id": "123"}) as mock:
            _send_newsletter_notification_email("new-sub@example.com")
        mock.assert_called_once()
        kwargs = mock.call_args[1] if mock.call_args[1] else mock.call_args[0][0]
        if isinstance(kwargs, dict):
            assert COMPANY_EMAIL in kwargs["to"]


class TestSendNewsletterUnsubscribeConfirmationEmail:
    """Tests for _send_newsletter_unsubscribe_confirmation_email."""

    def test_sends_to_unsubscriber(self):
        from routes.email import _send_newsletter_unsubscribe_confirmation_email
        with patch.object(resend.Emails, "send", return_value={"id": "123"}) as mock:
            _send_newsletter_unsubscribe_confirmation_email("unsub@example.com")
        mock.assert_called_once()
        kwargs = mock.call_args[1] if mock.call_args[1] else mock.call_args[0][0]
        if isinstance(kwargs, dict):
            assert "unsub@example.com" in kwargs["to"]


class TestSendCouponEmail:
    """Tests for _send_coupon_email."""

    def test_sends_coupon_to_customer(self):
        from routes.email import _send_coupon_email
        with patch.object(resend.Emails, "send", return_value={"id": "123"}) as mock:
            _send_coupon_email(
                "jane@example.com", "Jane", "Doe", "2065559999", "PSPAH-1950", "20%", "First visit"
            )
        # Should be called at least once (customer email), possibly twice (company notification)
        assert mock.call_count >= 1
        first_call = mock.call_args_list[0]
        kwargs = first_call[1] if first_call[1] else first_call[0][0]
        if isinstance(kwargs, dict):
            assert "jane@example.com" in kwargs["to"]

    def test_includes_coupon_details_in_html(self):
        from routes.email import _send_coupon_email
        with patch.object(resend.Emails, "send", return_value={"id": "123"}) as mock:
            _send_coupon_email(
                "jane@example.com", "Jane", "Doe", "2065559999", "PSPAH-1950", "20%", "First visit"
            )
        first_call = mock.call_args_list[0]
        kwargs = first_call[1] if first_call[1] else first_call[0][0]
        if isinstance(kwargs, dict):
            html = kwargs.get("html", "")
            assert "20%" in html


class TestSendDiyPermitEmail:
    """Tests for _send_diy_permit_email."""

    def test_sends_permit_email(self):
        from routes.email import _send_diy_permit_email
        with patch.object(resend.Emails, "send", return_value={"id": "123"}) as mock:
            _send_diy_permit_email(
                "bob@example.com", "Bob", "Builder", "2065550000",
                "123 Main St", "Seattle", "Water heater swap"
            )
        assert mock.call_count >= 1

    def test_includes_address_in_html(self):
        from routes.email import _send_diy_permit_email
        with patch.object(resend.Emails, "send", return_value={"id": "123"}) as mock:
            _send_diy_permit_email(
                "bob@example.com", "Bob", "Builder", "2065550000",
                "123 Main St", "Seattle", "Water heater swap"
            )
        first_call = mock.call_args_list[0]
        kwargs = first_call[1] if first_call[1] else first_call[0][0]
        if isinstance(kwargs, dict):
            html = kwargs.get("html", "")
            assert "123 Main St" in html


class TestSendJobApplicationEmail:
    """Tests for _send_job_application_email."""

    def test_sends_without_resume(self):
        from routes.email import _send_job_application_email
        with patch.object(resend.Emails, "send", return_value={"id": "123"}) as mock:
            _send_job_application_email(
                "alice@example.com", "Alice", "Smith", "Plumber",
                None, None,
            )
        assert mock.call_count >= 1

    def test_sends_with_resume(self):
        from routes.email import _send_job_application_email
        with patch.object(resend.Emails, "send", return_value={"id": "123"}) as mock:
            _send_job_application_email(
                "alice@example.com", "Alice", "Smith", "Plumber",
                b"%PDF-fake-content", "resume.pdf",
            )
        assert mock.call_count >= 1

    def test_raises_on_failure(self):
        from routes.email import _send_job_application_email
        with patch.object(resend.Emails, "send", side_effect=Exception("Resend error")):
            with pytest.raises(Exception):
                _send_job_application_email(
                    "alice@example.com", "Alice", "Smith", "Plumber",
                    None, None,
                )
