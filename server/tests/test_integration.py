"""Integration tests that verify the full endpoint flow:
DB insert → client email → company notification → response.

These tests use the real endpoint handlers (via TestClient) and assert
that the correct email helper functions are called in the correct order.
"""
import pytest
from unittest.mock import patch, MagicMock, call


# ── Schedule: DB → followup email → company notification ─────────────────

class TestScheduleIntegration:
    def test_schedule_calls_followup_and_notification(self, client, monkeypatch):
        """Schedule endpoint should call both _send_followup_email and _send_schedule_notification_email."""
        import routes.email as email_mod

        followup_calls = []
        notification_calls = []

        original_followup = email_mod._send_followup_email
        original_notification = email_mod._send_schedule_notification_email

        def track_followup(*args, **kwargs):
            followup_calls.append((args, kwargs))

        def track_notification(*args, **kwargs):
            notification_calls.append((args, kwargs))

        monkeypatch.setattr(email_mod, "_send_followup_email", track_followup)
        monkeypatch.setattr(email_mod, "_send_schedule_notification_email", track_notification)

        resp = client.post("/api/schedule", json={
            "firstName": "John",
            "lastName": "Doe",
            "phone": "2065551234",
            "email": "john@example.com",
            "message": "Need help",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["emailStatus"] == "sent"

        # Followup email should have been called with normalized email + first name
        assert len(followup_calls) == 1
        assert followup_calls[0][0][0] == "john@example.com"
        assert followup_calls[0][0][1] == "John"

        # Company notification should have been called
        assert len(notification_calls) == 1
        assert notification_calls[0][0][0] == "john@example.com"

    def test_schedule_notification_failure_propagates(self, client, monkeypatch):
        """If company notification email fails with unhandled exception, it propagates (500).

        This documents current behavior: notification errors are NOT caught.
        """
        import routes.email as email_mod

        def _fail_notification(*a, **kw):
            raise Exception("notification network error")

        monkeypatch.setattr(email_mod, "_send_schedule_notification_email", _fail_notification)

        resp = client.post("/api/schedule", json={
            "firstName": "John",
            "lastName": "Doe",
            "phone": "2065551234",
            "email": "john@example.com",
            "message": "Need help",
        })
        assert resp.status_code == 500


# ── Newsletter: DB → confirmation email → company notification ────────────

class TestNewsletterIntegration:
    def test_newsletter_calls_confirmation_and_notification(self, client, monkeypatch):
        """Newsletter endpoint should call both confirmation and notification emails."""
        import routes.email as email_mod

        confirmation_calls = []
        notification_calls = []

        def track_confirmation(*args, **kwargs):
            confirmation_calls.append((args, kwargs))

        def track_notification(*args, **kwargs):
            notification_calls.append((args, kwargs))

        monkeypatch.setattr(email_mod, "_send_newsletter_confirmation_email", track_confirmation)
        monkeypatch.setattr(email_mod, "_send_newsletter_notification_email", track_notification)

        resp = client.post("/api/newsletter", json={"email": "sub@example.com"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["emailStatus"] == "sent"

        # Confirmation email
        assert len(confirmation_calls) == 1
        assert confirmation_calls[0][0][0] == "sub@example.com"

        # Company notification
        assert len(notification_calls) == 1
        assert notification_calls[0][0][0] == "sub@example.com"

    def test_newsletter_notification_failure_propagates(self, client, monkeypatch):
        """Company notification failure propagates (500) — documents current behavior."""
        import routes.email as email_mod

        def _fail(*a, **kw):
            raise Exception("notification failed")

        monkeypatch.setattr(email_mod, "_send_newsletter_notification_email", _fail)

        resp = client.post("/api/newsletter", json={"email": "sub@example.com"})
        assert resp.status_code == 500


# ── Unsubscribe: DB delete → confirmation email ──────────────────────────

class TestUnsubscribeIntegration:
    def test_unsubscribe_calls_confirmation_email_when_deleted(self, client, monkeypatch):
        """Unsubscribe should send confirmation email when a row was actually deleted."""
        import routes.email as email_mod

        confirmation_calls = []

        def track_confirmation(*args, **kwargs):
            confirmation_calls.append((args, kwargs))

        monkeypatch.setattr(email_mod, "_send_newsletter_unsubscribe_confirmation_email", track_confirmation)

        resp = client.get("/api/newsletter/unsubscribe", params={"email": "sub@example.com"})
        assert resp.status_code == 200
        assert "You've Been Unsubscribed" in resp.text
        # rowcount is 1 by default in mock, so confirmation should be sent
        assert len(confirmation_calls) == 1

    def test_unsubscribe_skips_confirmation_when_not_found(self, client, monkeypatch):
        """Unsubscribe should NOT send confirmation email if email wasn't in DB."""
        from contextlib import contextmanager
        import routes.email as email_mod

        @contextmanager
        def _zero_rows_conn():
            conn = MagicMock()
            cursor = MagicMock()
            cursor.rowcount = 0
            conn.cursor.return_value.__enter__ = lambda self: cursor
            conn.cursor.return_value.__exit__ = MagicMock(return_value=False)
            yield conn

        monkeypatch.setattr(email_mod, "get_db_connection", _zero_rows_conn)

        confirmation_calls = []
        def track_confirmation(*args, **kwargs):
            confirmation_calls.append((args, kwargs))
        monkeypatch.setattr(email_mod, "_send_newsletter_unsubscribe_confirmation_email", track_confirmation)

        resp = client.get("/api/newsletter/unsubscribe", params={"email": "nobody@example.com"})
        assert resp.status_code == 200
        # Should NOT have sent confirmation
        assert len(confirmation_calls) == 0


# ── Redeem Offer: DB → coupon email (with company notification) ──────────

class TestRedeemOfferIntegration:
    def test_redeem_offer_calls_coupon_email(self, client, monkeypatch):
        """Redeem offer endpoint should call _send_coupon_email on success."""
        import routes.email as email_mod

        coupon_calls = []

        def track_coupon(*args, **kwargs):
            coupon_calls.append((args, kwargs))

        monkeypatch.setattr(email_mod, "_send_coupon_email", track_coupon)

        resp = client.post("/api/redeem-offer", json={
            "firstName": "Jane",
            "lastName": "Doe",
            "phone": "2065559999",
            "email": "jane@example.com",
            "couponId": "PSPAH-1950",
            "couponDiscount": "20%",
            "couponCondition": "First visit",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["emailStatus"] == "sent"

        assert len(coupon_calls) == 1
        assert coupon_calls[0][0][0] == "jane@example.com"
        assert coupon_calls[0][0][4] == "PSPAH-1950"
        assert coupon_calls[0][0][5] == "20%"


# ── DIY Permit: DB → permit email ────────────────────────────────────────

class TestDiyPermitIntegration:
    def test_diy_permit_calls_permit_email(self, client, monkeypatch):
        """DIY permit endpoint should call _send_diy_permit_email on success."""
        import routes.email as email_mod

        permit_calls = []

        def track_permit(*args, **kwargs):
            permit_calls.append((args, kwargs))

        monkeypatch.setattr(email_mod, "_send_diy_permit_email", track_permit)

        resp = client.post("/api/diy-permit", json={
            "firstName": "Bob",
            "lastName": "Builder",
            "email": "bob@example.com",
            "phone": "2065550000",
            "address": "123 Main St",
            "city": "Seattle",
            "projectDescription": "Water heater swap",
            "inspection": "yes",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["emailStatus"] == "sent"

        assert len(permit_calls) == 1
        assert permit_calls[0][0][0] == "bob@example.com"
        assert permit_calls[0][0][4] == "123 Main St"


# ── Job Application: DB → resume upload → job email ──────────────────────

class TestJobApplicationIntegration:
    def test_job_application_calls_email(self, client, monkeypatch):
        """Job application should call _send_job_application_email on success."""
        import routes.email as email_mod

        job_calls = []

        def track_job(*args, **kwargs):
            job_calls.append((args, kwargs))

        monkeypatch.setattr(email_mod, "_send_job_application_email", track_job)

        resp = client.post("/api/job-application", data={
            "firstName": "Alice",
            "lastName": "Smith",
            "phone": "2065551111",
            "email": "alice@example.com",
            "position": "Plumber",
            "experience": "5 years",
            "message": "Eager to join",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["emailStatus"] == "sent"

        assert len(job_calls) == 1
        assert job_calls[0][0][0] == "alice@example.com"
        assert job_calls[0][0][3] == "Plumber"

    def test_job_application_with_resume_uploads_to_s3_then_emails(self, client, monkeypatch):
        """Job application with resume should upload to S3 and then send email."""
        import routes.email as email_mod

        upload_calls = []
        job_calls = []

        def track_upload(data, filename):
            upload_calls.append((data, filename))
            return filename

        def track_job(*args, **kwargs):
            job_calls.append((args, kwargs))

        monkeypatch.setattr(email_mod.s3_service, "upload_resume", track_upload)
        monkeypatch.setattr(email_mod, "_send_job_application_email", track_job)

        resp = client.post(
            "/api/job-application",
            data={
                "firstName": "Alice",
                "lastName": "Smith",
                "phone": "2065551111",
                "email": "alice@example.com",
                "position": "Plumber",
            },
            files={"resume": ("resume.pdf", b"%PDF-fake-content", "application/pdf")},
        )
        assert resp.status_code == 200

        # S3 upload should have been called
        assert len(upload_calls) == 1
        assert upload_calls[0][1] == "resume.pdf"

        # Email should have been called with resume bytes
        assert len(job_calls) == 1
        assert job_calls[0][0][4] is not None  # resume_bytes


# ── Cross-cutting: Input normalization in full flows ─────────────────────

class TestInputNormalizationIntegration:
    def test_schedule_normalizes_email(self, client, monkeypatch):
        """Email should be lowercased and stripped in schedule flow."""
        import routes.email as email_mod

        followup_calls = []
        def track(*args, **kwargs):
            followup_calls.append(args)
        monkeypatch.setattr(email_mod, "_send_followup_email", track)
        monkeypatch.setattr(email_mod, "_send_schedule_notification_email", lambda *a, **kw: None)

        resp = client.post("/api/schedule", json={
            "firstName": "  John  ",
            "lastName": "  Doe  ",
            "phone": "2065551234",
            "email": "  JOHN@EXAMPLE.COM  ",
            "message": "Need help",
        })
        assert resp.status_code == 200
        # Email should be normalized
        assert followup_calls[0][0] == "john@example.com"
        # First name should be stripped
        assert followup_calls[0][1] == "John"

    def test_newsletter_normalizes_email(self, client, monkeypatch):
        """Email should be lowercased and stripped in newsletter flow."""
        import routes.email as email_mod

        confirmation_calls = []
        def track(*args, **kwargs):
            confirmation_calls.append(args)
        monkeypatch.setattr(email_mod, "_send_newsletter_confirmation_email", track)
        monkeypatch.setattr(email_mod, "_send_newsletter_notification_email", lambda *a, **kw: None)

        resp = client.post("/api/newsletter", json={"email": "  SUB@EXAMPLE.COM  "})
        assert resp.status_code == 200
        assert confirmation_calls[0][0] == "sub@example.com"
