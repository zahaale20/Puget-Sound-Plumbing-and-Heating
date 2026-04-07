"""Focused tests for /api/redeem-offer and /api/diy-permit branches."""

from unittest.mock import MagicMock

from fastapi import HTTPException
from fastapi.testclient import TestClient


def _client():
    from main import app

    return TestClient(app, base_url="http://localhost")


class _InsertCursor:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def execute(self, query, params):
        return None


class _InsertConnection:
    def __init__(self):
        self.commit = MagicMock()
        self.rollback = MagicMock()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def cursor(self):
        return _InsertCursor()


class _DuplicateCheckCursor:
    def __init__(self, duplicate_exists):
        self.duplicate_exists = duplicate_exists

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def execute(self, query, params):
        return None

    def fetchone(self):
        if self.duplicate_exists:
            return (1,)
        return None


class _DuplicateCheckConnection:
    def __init__(self, duplicate_exists):
        self.duplicate_exists = duplicate_exists

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def cursor(self):
        return _DuplicateCheckCursor(self.duplicate_exists)


class TestRedeemOfferEndpoint:
    def test_redeem_offer_captcha_failure_returns_403(self, monkeypatch):
        import routes.offers as mod

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, endpoint: (True, None))
        monkeypatch.setattr(mod, "verify_captcha", lambda token: False)

        response = _client().post(
            "/api/redeem-offer",
            json={
                "firstName": "Jane",
                "lastName": "Doe",
                "phone": "2065550100",
                "email": "jane@example.com",
                "couponDiscount": "$49.00 OFF",
                "couponCondition": "On any service",
                "captchaToken": "invalid",
            },
        )

        assert response.status_code == 403
        assert response.json()["detail"] == "Security verification failed. Please try again."

    def test_redeem_offer_duplicate_short_circuits(self, monkeypatch):
        import routes.offers as mod

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, endpoint: (True, None))
        monkeypatch.setattr(mod, "verify_captcha", lambda token: True)
        monkeypatch.setattr(mod, "get_db_connection", lambda: _DuplicateCheckConnection(duplicate_exists=True))
        send_coupon = MagicMock()
        monkeypatch.setattr(mod, "send_coupon_confirmation", send_coupon)

        response = _client().post(
            "/api/redeem-offer",
            json={
                "firstName": "Jane",
                "lastName": "Doe",
                "phone": "2065550100",
                "email": "jane@example.com",
                "couponDiscount": "$49.00 OFF",
                "couponCondition": "On any service",
                "captchaToken": "ok",
            },
        )

        assert response.status_code == 200
        assert response.json()["duplicate"] is True
        assert response.json()["emailStatus"] == "skipped"
        send_coupon.assert_not_called()

    def test_redeem_offer_coupon_email_http_error_propagates(self, monkeypatch):
        import routes.offers as mod

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, endpoint: (True, None))
        monkeypatch.setattr(mod, "verify_captcha", lambda token: True)
        monkeypatch.setattr(mod, "get_db_connection", lambda: _DuplicateCheckConnection(duplicate_exists=False))
        monkeypatch.setattr(
            mod,
            "send_coupon_confirmation",
            MagicMock(side_effect=HTTPException(status_code=502, detail="email provider error")),
        )

        response = _client().post(
            "/api/redeem-offer",
            json={
                "firstName": "Jane",
                "lastName": "Doe",
                "phone": "2065550100",
                "email": "jane@example.com",
                "couponDiscount": "$49.00 OFF",
                "couponCondition": "On any service",
                "captchaToken": "ok",
            },
        )

        assert response.status_code == 502
        assert response.json()["detail"] == "email provider error"


class TestDiyPermitEndpoint:
    def test_diy_permit_captcha_failure_returns_403(self, monkeypatch):
        import routes.diy_permit as mod

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, endpoint: (True, None))
        monkeypatch.setattr(mod, "verify_captcha", lambda token: False)

        response = _client().post(
            "/api/diy-permit",
            json={
                "firstName": "Alex",
                "lastName": "Stone",
                "email": "alex@example.com",
                "phone": "2065550100",
                "address": "123 Main St",
                "captchaToken": "invalid",
            },
        )

        assert response.status_code == 403
        assert response.json()["detail"] == "Security verification failed. Please try again."

    def test_diy_permit_confirmation_email_failure_returns_failed_status(self, monkeypatch):
        import routes.diy_permit as mod

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, endpoint: (True, None))
        monkeypatch.setattr(mod, "verify_captcha", lambda token: True)
        monkeypatch.setattr(mod, "get_db_connection", lambda: _InsertConnection())
        monkeypatch.setattr(
            mod,
            "send_diy_permit_confirmation",
            MagicMock(side_effect=HTTPException(status_code=500, detail="smtp unavailable")),
        )

        response = _client().post(
            "/api/diy-permit",
            json={
                "firstName": "Alex",
                "lastName": "Stone",
                "email": "alex@example.com",
                "phone": "2065550100",
                "address": "123 Main St",
                "city": "Seattle",
                "state": "WA",
                "zipCode": "98101",
                "projectDescription": "Replace faucet",
                "inspection": "yes",
                "captchaToken": "token",
            },
        )

        assert response.status_code == 200
        assert response.json() == {
            "success": True,
            "emailStatus": "failed",
            "message": "Request saved, but confirmation email could not be sent.",
        }
