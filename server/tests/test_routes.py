"""Tests for all email route endpoints."""
import pytest
from unittest.mock import patch, MagicMock


# ── Root endpoint ─────────────────────────────────────────────────────────

def test_root(client):
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.json()["status"] == "PSPAH API is running"


# ── POST /api/verify-captcha ────────────────────────────────────────────

def test_verify_captcha_no_token(client):
    resp = client.post("/api/verify-captcha", json={})
    assert resp.status_code == 400


def test_verify_captcha_not_configured(client):
    """When HCAPTCHA_SECRET_KEY is unset, allow."""
    resp = client.post("/api/verify-captcha", json={"token": "abc"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True


def test_verify_captcha_success(client, enable_captcha):
    mock_resp = MagicMock()
    mock_resp.json.return_value = {"success": True}
    mock_resp.raise_for_status = MagicMock()
    with patch("routes.email.requests.post", return_value=mock_resp):
        resp = client.post("/api/verify-captcha", json={"token": "valid"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True


def test_verify_captcha_failure(client, enable_captcha):
    mock_resp = MagicMock()
    mock_resp.json.return_value = {"success": False}
    mock_resp.raise_for_status = MagicMock()
    with patch("routes.email.requests.post", return_value=mock_resp):
        resp = client.post("/api/verify-captcha", json={"token": "bot"})
    assert resp.status_code == 403


def test_verify_captcha_rate_limited(client, monkeypatch):
    import routes.email as email_mod
    monkeypatch.setattr(email_mod, "check_rate_limit", lambda ip, ep: (False, "Rate limit exceeded."))
    resp = client.post("/api/verify-captcha", json={"token": "abc"})
    assert resp.status_code == 429


def test_verify_captcha_api_error(client, enable_captcha):
    import requests as req_lib
    with patch("routes.email.requests.post", side_effect=req_lib.RequestException("timeout")):
        resp = client.post("/api/verify-captcha", json={"token": "err"})
    assert resp.status_code == 500


def test_verify_captcha_hcaptcha_success_false(client, enable_captcha):
    """hCaptcha returns success=False — should 403."""
    mock_resp = MagicMock()
    mock_resp.json.return_value = {"success": False}
    mock_resp.raise_for_status = MagicMock()
    with patch("routes.email.requests.post", return_value=mock_resp):
        resp = client.post("/api/verify-captcha", json={"token": "invalid"})
    assert resp.status_code == 403


# ── POST /api/send-email ─────────────────────────────────────────────────

def test_send_email_success(client, mock_resend):
    resp = client.post("/api/send-email", json={
        "email": "user@example.com",
        "firstName": "Jane",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["emailStatus"] == "sent"
    mock_resend.assert_called_once()


def test_send_email_missing_fields(client):
    resp = client.post("/api/send-email", json={"email": "user@example.com"})
    assert resp.status_code == 422


def test_send_email_resend_failure(client, monkeypatch):
    """When Resend SDK throws, _raise_internal_api_error returns 500."""
    import resend
    monkeypatch.setattr(resend.Emails, "send", MagicMock(side_effect=Exception("Resend down")))
    resp = client.post("/api/send-email", json={
        "email": "user@example.com",
        "firstName": "Jane",
    })
    assert resp.status_code == 500  # Pydantic validation


def test_send_email_rate_limited(client, monkeypatch):
    import routes.email as email_mod
    monkeypatch.setattr(email_mod, "check_rate_limit", lambda ip, ep: (False, "Rate limit exceeded."))
    resp = client.post("/api/send-email", json={
        "email": "user@example.com",
        "firstName": "Jane",
    })
    assert resp.status_code == 429


def test_send_email_captcha_rejected(client, enable_captcha):
    """When captcha is enabled but no token supplied, reject."""
    resp = client.post("/api/send-email", json={
        "email": "user@example.com",
        "firstName": "Jane",
    })
    assert resp.status_code == 403


# ── POST /api/schedule ────────────────────────────────────────────────────

def _schedule_payload(**overrides):
    base = {
        "firstName": "John",
        "lastName": "Doe",
        "phone": "2065551234",
        "email": "john@example.com",
        "message": "Need help",
    }
    base.update(overrides)
    return base


def test_schedule_success(client):
    resp = client.post("/api/schedule", json=_schedule_payload())
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["emailStatus"] == "sent"


def test_schedule_duplicate(client, monkeypatch):
    """Duplicate insert returns success with duplicate flag."""
    from contextlib import contextmanager

    @contextmanager
    def _dup_conn():
        conn = MagicMock()
        cursor = MagicMock()
        cursor.execute.side_effect = Exception("duplicate key value violates unique constraint")
        conn.cursor.return_value.__enter__ = lambda self: cursor
        conn.cursor.return_value.__exit__ = MagicMock(return_value=False)
        yield conn

    import routes.email as email_mod
    monkeypatch.setattr(email_mod, "get_db_connection", _dup_conn)

    resp = client.post("/api/schedule", json=_schedule_payload())
    assert resp.status_code == 200
    data = resp.json()
    assert data["duplicate"] is True


def test_schedule_rate_limited(client, monkeypatch):
    import routes.email as email_mod
    monkeypatch.setattr(email_mod, "check_rate_limit", lambda ip, ep: (False, "Rate limit exceeded."))
    resp = client.post("/api/schedule", json=_schedule_payload())
    assert resp.status_code == 429


def test_schedule_captcha_rejected(client, enable_captcha):
    """When captcha is enabled but no token supplied, reject."""
    resp = client.post("/api/schedule", json=_schedule_payload())
    assert resp.status_code == 403


def test_schedule_email_failure(client, monkeypatch):
    """If email sending throws, endpoint still returns success (DB saved)."""
    from fastapi import HTTPException as _HTTPExc

    import routes.email as email_mod
    def _failing_email(*args, **kwargs):
        raise _HTTPExc(status_code=500, detail="mail service down")
    monkeypatch.setattr(email_mod, "_send_followup_email", _failing_email)

    resp = client.post("/api/schedule", json=_schedule_payload())
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["emailStatus"] == "failed"


def test_schedule_missing_fields(client):
    resp = client.post("/api/schedule", json={"firstName": "John"})
    assert resp.status_code == 422


def test_schedule_db_non_duplicate_error(client, monkeypatch):
    """A non-duplicate DB error should return 500."""
    from contextlib import contextmanager

    @contextmanager
    def _err_conn():
        conn = MagicMock()
        cursor = MagicMock()
        cursor.execute.side_effect = Exception("connection refused")
        conn.cursor.return_value.__enter__ = lambda self: cursor
        conn.cursor.return_value.__exit__ = MagicMock(return_value=False)
        yield conn

    import routes.email as email_mod
    monkeypatch.setattr(email_mod, "get_db_connection", _err_conn)
    resp = client.post("/api/schedule", json=_schedule_payload())
    assert resp.status_code == 500


def test_schedule_with_valid_recaptcha(client, enable_captcha):
    """Full happy path with reCAPTCHA enabled and a valid token."""
    mock_resp = MagicMock()
    mock_resp.json.return_value = {"success": True, "score": 0.9}
    mock_resp.raise_for_status = MagicMock()
    with patch("routes.email.requests.post", return_value=mock_resp):
        resp = client.post("/api/schedule", json=_schedule_payload(captchaToken="valid-token"))
    assert resp.status_code == 200
    assert resp.json()["success"] is True


# ── POST /api/newsletter ─────────────────────────────────────────────────

def test_newsletter_subscribe(client):
    resp = client.post("/api/newsletter", json={"email": "sub@example.com"})
    assert resp.status_code == 200
    assert resp.json()["success"] is True


def test_newsletter_duplicate(client, monkeypatch):
    from contextlib import contextmanager

    @contextmanager
    def _dup_conn():
        conn = MagicMock()
        cursor = MagicMock()
        cursor.execute.side_effect = Exception("unique constraint")
        conn.cursor.return_value.__enter__ = lambda self: cursor
        conn.cursor.return_value.__exit__ = MagicMock(return_value=False)
        yield conn

    import routes.email as email_mod
    monkeypatch.setattr(email_mod, "get_db_connection", _dup_conn)

    resp = client.post("/api/newsletter", json={"email": "dup@example.com"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["duplicate"] is True


def test_newsletter_rate_limited(client, monkeypatch):
    import routes.email as email_mod
    monkeypatch.setattr(email_mod, "check_rate_limit", lambda ip, ep: (False, "Rate limit exceeded."))
    resp = client.post("/api/newsletter", json={"email": "x@example.com"})
    assert resp.status_code == 429


def test_newsletter_captcha_rejected(client, enable_captcha):
    resp = client.post("/api/newsletter", json={"email": "x@example.com"})
    assert resp.status_code == 403


def test_newsletter_email_failure(client, monkeypatch):
    """Newsletter saved but confirmation email fails — non-duplicate."""
    from fastapi import HTTPException as _HTTPExc
    import routes.email as email_mod
    def _fail(*a, **kw):
        raise _HTTPExc(status_code=500, detail="mail down")
    monkeypatch.setattr(email_mod, "_send_newsletter_confirmation_email", _fail)
    resp = client.post("/api/newsletter", json={"email": "new@example.com"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["emailStatus"] == "failed"
    assert "duplicate" not in data


def test_newsletter_duplicate_email_success(client, monkeypatch):
    """Duplicate subscriber re-subscribes and email sends — duplicate flag in response."""
    from contextlib import contextmanager

    @contextmanager
    def _dup_conn():
        conn = MagicMock()
        cursor = MagicMock()
        cursor.execute.side_effect = Exception("unique constraint")
        conn.cursor.return_value.__enter__ = lambda self: cursor
        conn.cursor.return_value.__exit__ = MagicMock(return_value=False)
        yield conn

    import routes.email as email_mod
    monkeypatch.setattr(email_mod, "get_db_connection", _dup_conn)

    resp = client.post("/api/newsletter", json={"email": "dup@example.com"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["emailStatus"] == "sent"
    assert data["duplicate"] is True
    assert "already subscribed" in data["message"]


def test_newsletter_duplicate_email_failure(client, monkeypatch):
    """Duplicate subscriber + email failure — specific duplicate message."""
    from contextlib import contextmanager
    from fastapi import HTTPException as _HTTPExc

    @contextmanager
    def _dup_conn():
        conn = MagicMock()
        cursor = MagicMock()
        cursor.execute.side_effect = Exception("unique constraint")
        conn.cursor.return_value.__enter__ = lambda self: cursor
        conn.cursor.return_value.__exit__ = MagicMock(return_value=False)
        yield conn

    import routes.email as email_mod
    monkeypatch.setattr(email_mod, "get_db_connection", _dup_conn)
    def _fail(*a, **kw):
        raise _HTTPExc(status_code=500, detail="mail down")
    monkeypatch.setattr(email_mod, "_send_newsletter_confirmation_email", _fail)

    resp = client.post("/api/newsletter", json={"email": "dup@example.com"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["emailStatus"] == "failed"
    assert data["duplicate"] is True
    assert "already subscribed" in data["message"]


# ── GET /api/newsletter/unsubscribe ───────────────────────────────────────

def test_unsubscribe_success(client):
    resp = client.get("/api/newsletter/unsubscribe", params={"email": "sub@example.com"})
    assert resp.status_code == 204


def test_unsubscribe_with_valid_token(client):
    from routes.email import _generate_newsletter_unsubscribe_token
    email = "sub@example.com"
    token = _generate_newsletter_unsubscribe_token(email)
    resp = client.get("/api/newsletter/unsubscribe", params={"email": email, "token": token})
    assert resp.status_code == 204


def test_unsubscribe_with_invalid_token(client):
    resp = client.get(
        "/api/newsletter/unsubscribe",
        params={"email": "sub@example.com", "token": "bad-token"},
    )
    assert resp.status_code == 400


def test_unsubscribe_email_not_in_db(client, monkeypatch):
    """Unsubscribing an email not in the DB still returns 204 (idempotent)."""
    from contextlib import contextmanager

    @contextmanager
    def _zero_rows_conn():
        conn = MagicMock()
        cursor = MagicMock()
        cursor.rowcount = 0
        conn.cursor.return_value.__enter__ = lambda self: cursor
        conn.cursor.return_value.__exit__ = MagicMock(return_value=False)
        yield conn

    import routes.email as email_mod
    monkeypatch.setattr(email_mod, "get_db_connection", _zero_rows_conn)
    resp = client.get("/api/newsletter/unsubscribe", params={"email": "nobody@example.com"})
    assert resp.status_code == 204


def test_unsubscribe_db_error(client, monkeypatch):
    """DB error during unsubscribe should return 500."""
    from contextlib import contextmanager

    @contextmanager
    def _err_conn():
        conn = MagicMock()
        cursor = MagicMock()
        cursor.execute.side_effect = Exception("connection lost")
        conn.cursor.return_value.__enter__ = lambda self: cursor
        conn.cursor.return_value.__exit__ = MagicMock(return_value=False)
        yield conn

    import routes.email as email_mod
    monkeypatch.setattr(email_mod, "get_db_connection", _err_conn)
    resp = client.get("/api/newsletter/unsubscribe", params={"email": "x@example.com"})
    assert resp.status_code == 500


def test_unsubscribe_confirmation_email_failure(client, monkeypatch):
    """Unsubscribe succeeds even when confirmation email fails."""
    from fastapi import HTTPException as _HTTPExc
    import routes.email as email_mod
    def _fail(*a, **kw):
        raise _HTTPExc(status_code=500, detail="mail down")
    monkeypatch.setattr(email_mod, "_send_newsletter_unsubscribe_confirmation_email", _fail)
    resp = client.get("/api/newsletter/unsubscribe", params={"email": "sub@example.com"})
    assert resp.status_code == 204


def test_unsubscribe_empty_token_skips_validation(client):
    """Empty string token should skip HMAC validation (treated as no token)."""
    resp = client.get(
        "/api/newsletter/unsubscribe",
        params={"email": "sub@example.com", "token": "   "},
    )
    assert resp.status_code == 204


def test_unsubscribe_rate_limited(client, monkeypatch):
    import routes.email as email_mod
    monkeypatch.setattr(email_mod, "check_rate_limit", lambda ip, ep: (False, "Rate limit exceeded."))
    resp = client.get("/api/newsletter/unsubscribe", params={"email": "x@example.com"})
    assert resp.status_code == 429


# ── POST /api/redeem-offer ────────────────────────────────────────────────

def _offer_payload(**overrides):
    base = {
        "firstName": "Jane",
        "lastName": "Doe",
        "phone": "2065559999",
        "email": "jane@example.com",
        "couponDiscount": "20%",
        "couponCondition": "First visit",
    }
    base.update(overrides)
    return base


def test_redeem_offer_success(client):
    resp = client.post("/api/redeem-offer", json=_offer_payload())
    assert resp.status_code == 200
    assert resp.json()["success"] is True


def test_redeem_offer_duplicate(client, monkeypatch):
    from contextlib import contextmanager

    @contextmanager
    def _dup_conn():
        conn = MagicMock()
        cursor = MagicMock()
        cursor.execute.side_effect = Exception("duplicate key")
        conn.cursor.return_value.__enter__ = lambda self: cursor
        conn.cursor.return_value.__exit__ = MagicMock(return_value=False)
        yield conn

    import routes.email as email_mod
    monkeypatch.setattr(email_mod, "get_db_connection", _dup_conn)

    resp = client.post("/api/redeem-offer", json=_offer_payload())
    assert resp.status_code == 200
    assert resp.json()["duplicate"] is True


def test_redeem_offer_rate_limited(client, monkeypatch):
    import routes.email as email_mod
    monkeypatch.setattr(email_mod, "check_rate_limit", lambda ip, ep: (False, "Rate limit exceeded."))
    resp = client.post("/api/redeem-offer", json=_offer_payload())
    assert resp.status_code == 429


def test_redeem_offer_captcha_rejected(client, enable_captcha):
    resp = client.post("/api/redeem-offer", json=_offer_payload())
    assert resp.status_code == 403


def test_redeem_offer_email_failure(client, monkeypatch):
    """Offer saved but coupon email fails."""
    from fastapi import HTTPException as _HTTPExc
    import routes.email as email_mod
    def _fail(*a, **kw):
        raise _HTTPExc(status_code=500, detail="mail down")
    monkeypatch.setattr(email_mod, "_send_coupon_email", _fail)
    resp = client.post("/api/redeem-offer", json=_offer_payload())
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["emailStatus"] == "failed"


# ── POST /api/diy-permit ─────────────────────────────────────────────────

def _permit_payload(**overrides):
    base = {
        "firstName": "Bob",
        "lastName": "Builder",
        "email": "bob@example.com",
        "phone": "2065550000",
        "address": "123 Main St",
        "city": "Seattle",
        "projectDescription": "Water heater swap",
        "inspection": "yes",
    }
    base.update(overrides)
    return base


def test_diy_permit_success(client):
    resp = client.post("/api/diy-permit", json=_permit_payload())
    assert resp.status_code == 200
    assert resp.json()["success"] is True


def test_diy_permit_duplicate(client, monkeypatch):
    from contextlib import contextmanager

    @contextmanager
    def _dup_conn():
        conn = MagicMock()
        cursor = MagicMock()
        cursor.execute.side_effect = Exception("unique constraint violated")
        conn.cursor.return_value.__enter__ = lambda self: cursor
        conn.cursor.return_value.__exit__ = MagicMock(return_value=False)
        yield conn

    import routes.email as email_mod
    monkeypatch.setattr(email_mod, "get_db_connection", _dup_conn)

    resp = client.post("/api/diy-permit", json=_permit_payload())
    assert resp.status_code == 200
    assert resp.json()["duplicate"] is True


def test_diy_permit_rate_limited(client, monkeypatch):
    import routes.email as email_mod
    monkeypatch.setattr(email_mod, "check_rate_limit", lambda ip, ep: (False, "Rate limit exceeded."))
    resp = client.post("/api/diy-permit", json=_permit_payload())
    assert resp.status_code == 429


def test_diy_permit_captcha_rejected(client, enable_captcha):
    resp = client.post("/api/diy-permit", json=_permit_payload())
    assert resp.status_code == 403


def test_diy_permit_email_failure(client, monkeypatch):
    """Permit saved but confirmation email fails."""
    from fastapi import HTTPException as _HTTPExc
    import routes.email as email_mod
    def _fail(*a, **kw):
        raise _HTTPExc(status_code=500, detail="mail down")
    monkeypatch.setattr(email_mod, "_send_diy_permit_email", _fail)
    resp = client.post("/api/diy-permit", json=_permit_payload())
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["emailStatus"] == "failed"


# ── POST /api/job-application (multipart/form-data) ──────────────────────

def _job_form_data(**overrides):
    base = {
        "firstName": "Alice",
        "lastName": "Smith",
        "phone": "2065551111",
        "email": "alice@example.com",
        "position": "Plumber",
        "experience": "5 years",
        "message": "Eager to join",
    }
    base.update(overrides)
    return base


def test_job_application_success(client):
    resp = client.post("/api/job-application", data=_job_form_data())
    assert resp.status_code == 200
    assert resp.json()["success"] is True


def test_job_application_with_resume(client):
    form = _job_form_data()
    resp = client.post(
        "/api/job-application",
        data=form,
        files={"resume": ("resume.pdf", b"%PDF-fake-content", "application/pdf")},
    )
    assert resp.status_code == 200
    assert resp.json()["success"] is True


def test_job_application_duplicate(client, monkeypatch):
    from contextlib import contextmanager

    @contextmanager
    def _dup_conn():
        conn = MagicMock()
        cursor = MagicMock()
        cursor.execute.side_effect = Exception("duplicate key value")
        conn.cursor.return_value.__enter__ = lambda self: cursor
        conn.cursor.return_value.__exit__ = MagicMock(return_value=False)
        yield conn

    import routes.email as email_mod
    monkeypatch.setattr(email_mod, "get_db_connection", _dup_conn)

    resp = client.post("/api/job-application", data=_job_form_data())
    assert resp.status_code == 200
    assert resp.json()["duplicate"] is True


def test_job_application_rate_limited(client, monkeypatch):
    import routes.email as email_mod
    monkeypatch.setattr(email_mod, "check_rate_limit", lambda ip, ep: (False, "Rate limit exceeded."))
    resp = client.post("/api/job-application", data=_job_form_data())
    assert resp.status_code == 429


def test_job_application_captcha_rejected(client, enable_captcha):
    resp = client.post("/api/job-application", data=_job_form_data())
    assert resp.status_code == 403


def test_job_application_missing_required_fields(client):
    resp = client.post("/api/job-application", data={"firstName": "Alice"})
    assert resp.status_code == 422


def test_job_application_email_failure(client, monkeypatch):
    """Application saved but email notification fails."""
    from fastapi import HTTPException as _HTTPExc
    import routes.email as email_mod
    def _fail(*a, **kw):
        raise _HTTPExc(status_code=500, detail="mail down")
    monkeypatch.setattr(email_mod, "_send_job_application_email", _fail)
    resp = client.post("/api/job-application", data=_job_form_data())
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["emailStatus"] == "failed"


def test_job_application_s3_upload_failure(client, monkeypatch):
    """S3 upload fails but application still succeeds (graceful degradation)."""
    import routes.email as email_mod
    monkeypatch.setattr(email_mod.s3_service, "upload_resume", lambda b, f: None)
    form = _job_form_data()
    resp = client.post(
        "/api/job-application",
        data=form,
        files={"resume": ("resume.pdf", b"%PDF-fake", "application/pdf")},
    )
    assert resp.status_code == 200
    assert resp.json()["success"] is True


# ── GET /api/images/{name} ───────────────────────────────────────────────

def test_get_image_url(client):
    resp = client.get("/api/images/hero.jpg")
    assert resp.status_code == 200
    data = resp.json()
    assert "url" in data
    assert "hero.jpg" in data["url"]


def test_get_image_url_nested(client):
    resp = client.get("/api/images/public/team/photo.png")
    assert resp.status_code == 200
    assert "public/team/photo.png" in resp.json()["url"]


def test_get_image_url_missing_cloudfront(client, monkeypatch):
    import routes.images as img_mod
    monkeypatch.setattr(img_mod.s3_service, "cloudfront_url", None)
    resp = client.get("/api/images/test.jpg")
    assert resp.status_code == 404


def test_get_image_url_rate_limited(client, monkeypatch):
    import routes.images as img_mod
    monkeypatch.setattr(img_mod, "check_rate_limit", lambda ip, ep: (False, "Rate limit exceeded."))
    resp = client.get("/api/images/hero.jpg")
    assert resp.status_code == 429


# ── CORS middleware ───────────────────────────────────────────────────────

def test_cors_allowed_origin(client):
    resp = client.get("/", headers={"Origin": "https://pugetsoundplumbing.com"})
    assert resp.headers.get("access-control-allow-origin") == "https://pugetsoundplumbing.com"


def test_cors_disallowed_origin(client):
    resp = client.get("/", headers={"Origin": "https://evil.com"})
    assert "access-control-allow-origin" not in resp.headers


def test_cors_preflight(client):
    resp = client.options(
        "/api/schedule",
        headers={
            "Origin": "https://pugetsoundplumbing.com",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert resp.status_code == 200
    assert resp.headers.get("access-control-allow-origin") == "https://pugetsoundplumbing.com"


# ── 404 for unknown routes ────────────────────────────────────────────────

def test_unknown_route_returns_404(client):
    resp = client.get("/api/nonexistent")
    assert resp.status_code == 404
