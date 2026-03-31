"""Tests for services and models."""
import time
import pytest
from unittest.mock import MagicMock, patch


# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  Rate Limiter                                                           ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

class TestRateLimiter:
    def test_allows_under_limit(self):
        from services.rate_limiter import check_rate_limit
        allowed, msg = check_rate_limit("1.2.3.4", "schedule")
        assert allowed is True

    def test_rejects_over_limit(self):
        from services.rate_limiter import check_rate_limit, _request_tracker
        _request_tracker["1.2.3.4"]["schedule"] = [(time.time(), 10)]
        allowed, msg = check_rate_limit("1.2.3.4", "schedule")
        assert allowed is False
        assert "Rate limit exceeded" in msg

    def test_unknown_endpoint_allowed(self):
        from services.rate_limiter import check_rate_limit
        allowed, msg = check_rate_limit("1.2.3.4", "nonexistent")
        assert allowed is True

    def test_window_expiry(self):
        from services.rate_limiter import check_rate_limit, _request_tracker
        old_time = time.time() - 7200  # 2 hours ago (outside 1-hour window)
        _request_tracker["1.2.3.4"]["schedule"] = [(old_time, 10)]
        allowed, _ = check_rate_limit("1.2.3.4", "schedule")
        assert allowed is True

    def test_reset_specific_endpoint(self):
        from services.rate_limiter import check_rate_limit, reset_rate_limit, _request_tracker
        _request_tracker["1.2.3.4"]["schedule"] = [(time.time(), 10)]
        reset_rate_limit("1.2.3.4", "schedule")
        allowed, _ = check_rate_limit("1.2.3.4", "schedule")
        assert allowed is True

    def test_reset_all_endpoints(self):
        from services.rate_limiter import check_rate_limit, reset_rate_limit, _request_tracker
        _request_tracker["1.2.3.4"]["schedule"] = [(time.time(), 10)]
        _request_tracker["1.2.3.4"]["newsletter"] = [(time.time(), 5)]
        reset_rate_limit("1.2.3.4")
        assert len(_request_tracker["1.2.3.4"]) == 0

    def test_increments_count(self):
        from services.rate_limiter import check_rate_limit, _request_tracker
        for _ in range(5):
            check_rate_limit("5.5.5.5", "newsletter")
        # 5 is the limit for newsletter, next should be rejected
        allowed, _ = check_rate_limit("5.5.5.5", "newsletter")
        assert allowed is False

    def test_different_ips_independent(self):
        from services.rate_limiter import check_rate_limit, _request_tracker
        _request_tracker["10.0.0.1"]["newsletter"] = [(time.time(), 5)]
        allowed, _ = check_rate_limit("10.0.0.2", "newsletter")
        assert allowed is True


# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  S3Service                                                              ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

class TestS3Service:
    def test_get_image_url(self):
        from services.s3_service import S3Service
        svc = S3Service.__new__(S3Service)
        svc.cloudfront_url = "https://cdn.example.com"
        assert svc.get_image_url("hero.jpg") == "https://cdn.example.com/hero.jpg"

    def test_get_image_url_strips_leading_slash(self):
        from services.s3_service import S3Service
        svc = S3Service.__new__(S3Service)
        svc.cloudfront_url = "https://cdn.example.com"
        assert svc.get_image_url("/hero.jpg") == "https://cdn.example.com/hero.jpg"

    def test_get_image_url_none_when_no_cloudfront(self):
        from services.s3_service import S3Service
        svc = S3Service.__new__(S3Service)
        svc.cloudfront_url = None
        assert svc.get_image_url("hero.jpg") is None

    def test_upload_resume_no_client(self):
        from services.s3_service import S3Service
        svc = S3Service.__new__(S3Service)
        svc.s3_client = None
        assert svc.upload_resume(b"data", "resume.pdf") is None

    def test_upload_resume_success(self):
        from services.s3_service import S3Service
        svc = S3Service.__new__(S3Service)
        svc.s3_client = MagicMock()
        svc.resumes_bucket = "bucket"
        result = svc.upload_resume(b"pdf-data", "resume.pdf")
        assert result == "resume.pdf"
        svc.s3_client.put_object.assert_called_once()
        call_kwargs = svc.s3_client.put_object.call_args[1]
        assert call_kwargs["ContentType"] == "application/pdf"

    def test_upload_resume_non_pdf(self):
        from services.s3_service import S3Service
        svc = S3Service.__new__(S3Service)
        svc.s3_client = MagicMock()
        svc.resumes_bucket = "bucket"
        result = svc.upload_resume(b"doc-data", "resume.docx")
        assert result == "resume.docx"
        call_kwargs = svc.s3_client.put_object.call_args[1]
        assert call_kwargs["ContentType"] == "application/octet-stream"

    def test_upload_resume_s3_error(self):
        from services.s3_service import S3Service
        svc = S3Service.__new__(S3Service)
        svc.s3_client = MagicMock()
        svc.resumes_bucket = "bucket"
        svc.s3_client.put_object.side_effect = Exception("S3 error")
        assert svc.upload_resume(b"data", "resume.pdf") is None


# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  Pydantic Models                                                        ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

class TestModels:
    def test_email_request_valid(self):
        from models.requests import EmailRequest
        r = EmailRequest(email="a@b.com", firstName="Jane")
        assert r.email == "a@b.com"

    def test_email_request_missing_field(self):
        from models.requests import EmailRequest
        with pytest.raises(Exception):
            EmailRequest(email="a@b.com")

    def test_schedule_request_defaults(self):
        from models.requests import ScheduleRequest
        r = ScheduleRequest(firstName="A", lastName="B", phone="1", email="a@b.com")
        assert r.message == ""
        assert r.captchaToken is None

    def test_newsletter_request(self):
        from models.requests import NewsletterRequest
        r = NewsletterRequest(email="a@b.com")
        assert r.captchaToken is None

    def test_redeem_offer_request(self):
        from models.requests import RedeemOfferRequest
        r = RedeemOfferRequest(
            firstName="A", lastName="B", phone="1",
            email="a@b.com", couponDiscount="10%", couponCondition="Any",
        )
        assert r.couponDiscount == "10%"

    def test_diy_permit_defaults(self):
        from models.requests import DiyPermitRequest
        r = DiyPermitRequest(
            firstName="A", lastName="B", email="a@b.com",
            phone="1", address="123 Main",
        )
        assert r.city == ""
        assert r.inspection == "unsure"


# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  Helper functions in email route                                        ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

class TestEmailHelpers:
    def test_normalize_email(self):
        from routes.email import _normalize_email
        assert _normalize_email("  FOO@Bar.COM  ") == "foo@bar.com"

    def test_normalize_text(self):
        from routes.email import _normalize_text
        assert _normalize_text("  hello  ") == "hello"

    def test_is_duplicate_error_unique(self):
        from routes.email import _is_duplicate_error
        assert _is_duplicate_error(Exception("unique constraint violated")) is True

    def test_is_duplicate_error_duplicate(self):
        from routes.email import _is_duplicate_error
        assert _is_duplicate_error(Exception("duplicate key value")) is True

    def test_is_duplicate_error_other(self):
        from routes.email import _is_duplicate_error
        assert _is_duplicate_error(Exception("connection refused")) is False

    def test_duplicate_response_structure(self):
        from routes.email import _duplicate_response
        resp = _duplicate_response("Already exists")
        assert resp["success"] is True
        assert resp["duplicate"] is True
        assert resp["emailStatus"] == "skipped"
        assert resp["message"] == "Already exists"

    def test_get_client_ip_from_client(self):
        from routes.email import _get_client_ip
        req = MagicMock()
        req.headers.get.return_value = None
        req.client.host = "192.168.1.1"
        assert _get_client_ip(req) == "192.168.1.1"

    def test_get_client_ip_from_forwarded_header(self):
        from routes.email import _get_client_ip
        req = MagicMock()
        req.headers.get.return_value = "10.0.0.1, 172.16.0.1"
        assert _get_client_ip(req) == "10.0.0.1"

    def test_get_client_ip_prefers_forwarded_over_client(self):
        """X-Forwarded-For takes priority over request.client (proxy support)."""
        from routes.email import _get_client_ip
        req = MagicMock()
        req.headers.get.return_value = "203.0.113.50"
        req.client.host = "10.0.0.1"  # proxy IP
        assert _get_client_ip(req) == "203.0.113.50"

    def test_get_client_ip_fallback(self):
        from routes.email import _get_client_ip
        req = MagicMock()
        req.client = None
        req.headers.get.return_value = None
        assert _get_client_ip(req) == "0.0.0.0"

    def test_verify_captcha_no_key(self, monkeypatch):
        import routes.email as mod
        monkeypatch.setattr(mod, "HCAPTCHA_SECRET_KEY", None)
        assert mod._verify_captcha("any-token") is True

    def test_verify_captcha_no_token(self, monkeypatch):
        import routes.email as mod
        monkeypatch.setattr(mod, "HCAPTCHA_SECRET_KEY", "key")
        assert mod._verify_captcha(None) is False

    def test_verify_captcha_success(self, monkeypatch):
        """hCaptcha returns success=True — should pass."""
        import routes.email as mod
        monkeypatch.setattr(mod, "HCAPTCHA_SECRET_KEY", "key")
        mock_resp = MagicMock()
        mock_resp.json.return_value = {"success": True}
        mock_resp.raise_for_status = MagicMock()
        with patch("routes.email.requests.post", return_value=mock_resp):
            assert mod._verify_captcha("token") is True

    def test_verify_captcha_hcaptcha_returns_failure(self, monkeypatch):
        """hCaptcha returns success=False (invalid token)."""
        import routes.email as mod
        monkeypatch.setattr(mod, "HCAPTCHA_SECRET_KEY", "key")
        mock_resp = MagicMock()
        mock_resp.json.return_value = {"success": False}
        mock_resp.raise_for_status = MagicMock()
        with patch("routes.email.requests.post", return_value=mock_resp):
            assert mod._verify_captcha("token") is False

    def test_verify_captcha_network_error(self, monkeypatch):
        """Network error during verification should fail securely."""
        import routes.email as mod
        monkeypatch.setattr(mod, "HCAPTCHA_SECRET_KEY", "key")
        with patch("routes.email.requests.post", side_effect=Exception("timeout")):
            assert mod._verify_captcha("token") is False

    def test_generate_unsubscribe_token_deterministic(self):
        from routes.email import _generate_newsletter_unsubscribe_token
        t1 = _generate_newsletter_unsubscribe_token("a@b.com")
        t2 = _generate_newsletter_unsubscribe_token("a@b.com")
        assert t1 == t2

    def test_generate_unsubscribe_token_case_insensitive(self):
        from routes.email import _generate_newsletter_unsubscribe_token
        t1 = _generate_newsletter_unsubscribe_token("A@B.COM")
        t2 = _generate_newsletter_unsubscribe_token("a@b.com")
        assert t1 == t2

    def test_build_unsubscribe_url(self, monkeypatch):
        import routes.email as mod
        monkeypatch.setenv("NEWSLETTER_UNSUBSCRIBE_BASE_URL", "https://api.test.com")
        url = mod._build_newsletter_unsubscribe_url("user@example.com")
        assert url.startswith("https://api.test.com/api/newsletter/unsubscribe")
        assert "email=" in url
        assert "token=" in url

    def test_build_unsubscribe_url_vercel_fallback(self, monkeypatch):
        import routes.email as mod
        monkeypatch.delenv("NEWSLETTER_UNSUBSCRIBE_BASE_URL", raising=False)
        monkeypatch.delenv("PUBLIC_API_BASE_URL", raising=False)
        monkeypatch.delenv("BACKEND_BASE_URL", raising=False)
        monkeypatch.setenv("VERCEL_URL", "my-app.vercel.app")
        url = mod._build_newsletter_unsubscribe_url("user@example.com")
        assert url.startswith("https://my-app.vercel.app/api/newsletter/unsubscribe")

    def test_build_unsubscribe_url_vercel_with_http(self, monkeypatch):
        import routes.email as mod
        monkeypatch.delenv("NEWSLETTER_UNSUBSCRIBE_BASE_URL", raising=False)
        monkeypatch.delenv("PUBLIC_API_BASE_URL", raising=False)
        monkeypatch.delenv("BACKEND_BASE_URL", raising=False)
        monkeypatch.setenv("VERCEL_URL", "https://my-app.vercel.app")
        url = mod._build_newsletter_unsubscribe_url("user@example.com")
        assert url.startswith("https://my-app.vercel.app/api/newsletter/unsubscribe")

    def test_build_unsubscribe_url_localhost_fallback(self, monkeypatch):
        import routes.email as mod
        monkeypatch.delenv("NEWSLETTER_UNSUBSCRIBE_BASE_URL", raising=False)
        monkeypatch.delenv("PUBLIC_API_BASE_URL", raising=False)
        monkeypatch.delenv("BACKEND_BASE_URL", raising=False)
        monkeypatch.delenv("VERCEL_URL", raising=False)
        url = mod._build_newsletter_unsubscribe_url("user@example.com")
        assert url.startswith("http://localhost:8001/api/newsletter/unsubscribe")

    def test_raise_internal_api_error(self):
        """Helper should raise HTTPException with 500."""
        from routes.email import _raise_internal_api_error
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            _raise_internal_api_error("test context", Exception("boom"))
        assert exc_info.value.status_code == 500
