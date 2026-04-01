"""Additional route edge-case tests to increase coverage.

Tests that cover scenarios not in the original test_routes.py:
- DB errors (non-duplicate) for redeem-offer, newsletter, job-application
- Valid captcha token paths for diy-permit, redeem-offer, job-application, newsletter
- Missing email field for newsletter
- Redeem offer missing required fields
"""
import pytest
from unittest.mock import patch, MagicMock
from contextlib import contextmanager


# ── POST /api/redeem-offer edge cases ─────────────────────────────────────

def _offer_payload(**overrides):
    base = {
        "firstName": "Jane",
        "lastName": "Doe",
        "phone": "2065559999",
        "email": "jane@example.com",
        "couponDiscount": "$19.50 OFF",
        "couponCondition": "ANY SERVICE UP TO $150",
    }
    base.update(overrides)
    return base


def test_redeem_offer_db_error(client, monkeypatch):
    """Non-duplicate DB error should return 500."""
    @contextmanager
    def _err_conn():
        conn = MagicMock()
        cursor = MagicMock()
        cursor.execute.side_effect = Exception("connection timeout")
        conn.cursor.return_value.__enter__ = lambda self: cursor
        conn.cursor.return_value.__exit__ = MagicMock(return_value=False)
        yield conn

    import routes.email as email_mod
    monkeypatch.setattr(email_mod, "get_db_connection", _err_conn)
    resp = client.post("/api/redeem-offer", json=_offer_payload())
    assert resp.status_code == 500


def test_redeem_offer_missing_required_fields(client):
    resp = client.post("/api/redeem-offer", json={"firstName": "Jane"})
    assert resp.status_code == 422


def test_redeem_offer_with_valid_captcha(client, enable_captcha):
    """Full happy path with hCaptcha enabled and a valid token."""
    mock_resp = MagicMock()
    mock_resp.json.return_value = {"success": True}
    mock_resp.raise_for_status = MagicMock()
    with patch("routes.email.requests.post", return_value=mock_resp):
        resp = client.post("/api/redeem-offer", json=_offer_payload(captchaToken="valid-token"))
    assert resp.status_code == 200
    assert resp.json()["success"] is True


# ── POST /api/newsletter edge cases ──────────────────────────────────────

def test_newsletter_missing_email(client):
    resp = client.post("/api/newsletter", json={})
    assert resp.status_code == 422


def test_newsletter_db_error(client, monkeypatch):
    """Non-duplicate DB error should return 500."""
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
    resp = client.post("/api/newsletter", json={"email": "x@example.com"})
    assert resp.status_code == 500


def test_newsletter_with_valid_captcha(client, enable_captcha):
    mock_resp = MagicMock()
    mock_resp.json.return_value = {"success": True}
    mock_resp.raise_for_status = MagicMock()
    with patch("routes.email.requests.post", return_value=mock_resp):
        resp = client.post("/api/newsletter", json={"email": "sub@example.com", "captchaToken": "valid"})
    assert resp.status_code == 200
    assert resp.json()["success"] is True


# ── POST /api/diy-permit edge cases ──────────────────────────────────────

def _permit_payload(**overrides):
    base = {
        "firstName": "Bob",
        "lastName": "Builder",
        "email": "bob@example.com",
        "phone": "2065550000",
        "address": "123 Main St",
    }
    base.update(overrides)
    return base


def test_diy_permit_db_error(client, monkeypatch):
    """Non-duplicate DB error should return 500."""
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
    resp = client.post("/api/diy-permit", json=_permit_payload())
    assert resp.status_code == 500


def test_diy_permit_with_valid_captcha(client, enable_captcha):
    mock_resp = MagicMock()
    mock_resp.json.return_value = {"success": True}
    mock_resp.raise_for_status = MagicMock()
    with patch("routes.email.requests.post", return_value=mock_resp):
        resp = client.post("/api/diy-permit", json={**_permit_payload(), "captchaToken": "valid"})
    assert resp.status_code == 200
    assert resp.json()["success"] is True


def test_diy_permit_missing_required_fields(client):
    resp = client.post("/api/diy-permit", json={"firstName": "Bob"})
    assert resp.status_code == 422


# ── POST /api/job-application edge cases ──────────────────────────────────

def _job_form_data(**overrides):
    base = {
        "firstName": "Alice",
        "lastName": "Smith",
        "phone": "2065551111",
        "email": "alice@example.com",
        "position": "Plumber",
    }
    base.update(overrides)
    return base


def test_job_application_db_error(client, monkeypatch):
    """Non-duplicate DB error should return 500."""
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
    resp = client.post("/api/job-application", data=_job_form_data())
    assert resp.status_code == 500


def test_job_application_with_valid_captcha(client, enable_captcha):
    mock_resp = MagicMock()
    mock_resp.json.return_value = {"success": True}
    mock_resp.raise_for_status = MagicMock()
    with patch("routes.email.requests.post", return_value=mock_resp):
        resp = client.post("/api/job-application", data={**_job_form_data(), "captchaToken": "valid"})
    assert resp.status_code == 200
    assert resp.json()["success"] is True


# ── POST /api/send-email edge cases ──────────────────────────────────────

def test_send_email_with_valid_captcha(client, enable_captcha):
    mock_resp = MagicMock()
    mock_resp.json.return_value = {"success": True}
    mock_resp.raise_for_status = MagicMock()
    with patch("routes.email.requests.post", return_value=mock_resp):
        resp = client.post("/api/send-email", json={
            "email": "user@example.com",
            "firstName": "Jane",
            "captchaToken": "valid-token",
        })
    assert resp.status_code == 200
    assert resp.json()["success"] is True


# ── GET /api/newsletter/unsubscribe edge cases ───────────────────────────

def test_unsubscribe_missing_email_param(client):
    """Missing email query param should return 422."""
    resp = client.get("/api/newsletter/unsubscribe")
    assert resp.status_code == 422


# ── Pydantic model edge cases ────────────────────────────────────────────

class TestModelEdgeCases:
    def test_schedule_request_with_all_fields(self):
        from models.requests import ScheduleRequest
        r = ScheduleRequest(
            firstName="A", lastName="B", phone="1", email="a@b.com",
            message="Help", captchaToken="tok123",
        )
        assert r.message == "Help"
        assert r.captchaToken == "tok123"

    def test_redeem_offer_request_with_captcha(self):
        from models.requests import RedeemOfferRequest
        r = RedeemOfferRequest(
            firstName="A", lastName="B", phone="1", email="a@b.com",
            couponDiscount="10%", couponCondition="Any", captchaToken="tok",
        )
        assert r.captchaToken == "tok"

    def test_diy_permit_all_fields(self):
        from models.requests import DiyPermitRequest
        r = DiyPermitRequest(
            firstName="A", lastName="B", email="a@b.com", phone="1",
            address="123 Main", city="Seattle",
            projectDescription="Replace pipes", inspection="yes",
            captchaToken="tok",
        )
        assert r.city == "Seattle"
        assert r.projectDescription == "Replace pipes"
        assert r.inspection == "yes"
        assert r.captchaToken == "tok"
