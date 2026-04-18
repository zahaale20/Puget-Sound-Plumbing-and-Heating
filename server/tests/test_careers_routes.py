from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from tests.conftest import make_async_cursor, make_async_db, make_unique_violation


def _ok_rate_limit():
    return AsyncMock(return_value=(True, "OK", 0))


def _denied_rate_limit():
    return AsyncMock(return_value=(False, "Too many", 3600))


class TestJobApplicationRoute:
    def _form(self):
        return {
            "firstName": "John",
            "lastName": "Doe",
            "phone": "2065551234",
            "email": "john@example.com",
            "position": "Plumber",
            "experience": "5 years",
            "message": "Ready to work",
            "additionalInfo": "None",
            "captchaToken": "tok",
        }

    def test_success_without_resume(self, client) -> None:
        factory, _ = make_async_db()
        with (
            patch("routes.careers.get_db_connection", factory),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.careers.verify_captcha", new_callable=AsyncMock, return_value=True),
            patch("routes.careers.send_job_application_confirmation", new_callable=AsyncMock),
            patch("routes.careers.send_job_application_notification", new_callable=AsyncMock),
        ):
            resp = client.post("/api/job-application", data=self._form())
        assert resp.status_code == 200
        assert resp.json()["success"] is True
        assert resp.json()["emailStatus"] == "sent"

    def test_success_with_resume(self, client) -> None:
        factory, _ = make_async_db()
        with (
            patch("routes.careers.get_db_connection", factory),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.careers.verify_captcha", new_callable=AsyncMock, return_value=True),
            patch("routes.careers.storage_service.upload_resume", new_callable=AsyncMock, return_value="resumes/abc.pdf") as mock_upload,
            patch("routes.careers.send_job_application_confirmation", new_callable=AsyncMock),
            patch("routes.careers.send_job_application_notification", new_callable=AsyncMock),
        ):
            resp = client.post(
                "/api/job-application",
                data=self._form(),
                files={"resume": ("resume.pdf", b"fake-pdf-bytes", "application/pdf")},
            )
        assert resp.status_code == 200
        mock_upload.assert_awaited_once()

    def test_duplicate_application(self, client) -> None:
        cur = make_async_cursor(execute_side_effect=make_unique_violation())
        factory, _ = make_async_db(cur)
        with (
            patch("routes.careers.get_db_connection", factory),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.careers.verify_captcha", new_callable=AsyncMock, return_value=True),
        ):
            resp = client.post("/api/job-application", data=self._form())
        assert resp.status_code == 200
        assert resp.json()["duplicate"] is True

    def test_rate_limited(self, client) -> None:
        with patch("services.rate_limiter.check_rate_limit", _denied_rate_limit()):
            resp = client.post("/api/job-application", data=self._form())
        assert resp.status_code == 429

    def test_captcha_failure(self, client) -> None:
        with (
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.careers.verify_captcha", new_callable=AsyncMock, return_value=False),
        ):
            resp = client.post("/api/job-application", data=self._form())
        assert resp.status_code == 403

    def test_email_failure_returns_failed_status(self, client) -> None:
        factory, _ = make_async_db()
        with (
            patch("routes.careers.get_db_connection", factory),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.careers.verify_captcha", new_callable=AsyncMock, return_value=True),
            patch(
                "routes.careers.send_job_application_confirmation",
                new_callable=AsyncMock,
                side_effect=HTTPException(500, "email err"),
            ),
        ):
            resp = client.post("/api/job-application", data=self._form())
        assert resp.status_code == 200
        assert resp.json()["emailStatus"] == "failed"

    def test_invalid_resume_content_type(self, client) -> None:
        factory, _ = make_async_db()
        with (
            patch("routes.careers.get_db_connection", factory),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.careers.verify_captcha", new_callable=AsyncMock, return_value=True),
        ):
            resp = client.post(
                "/api/job-application",
                data=self._form(),
                files={"resume": ("resume.pdf", b"bad", "text/plain")},
            )
        assert resp.status_code == 400

    def test_resume_too_large(self, client) -> None:
        factory, _ = make_async_db()
        big_payload = b"x" * (6 * 1024 * 1024)
        with (
            patch("routes.careers.get_db_connection", factory),
            patch("routes.careers.MAX_RESUME_SIZE_BYTES", 1024),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.careers.verify_captcha", new_callable=AsyncMock, return_value=True),
        ):
            resp = client.post(
                "/api/job-application",
                data=self._form(),
                files={"resume": ("resume.pdf", big_payload, "application/pdf")},
            )
        assert resp.status_code == 413

    def test_db_error_returns_500(self, client) -> None:
        with (
            patch("routes.careers.get_db_connection", side_effect=Exception("db down")),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.careers.verify_captcha", new_callable=AsyncMock, return_value=True),
        ):
            resp = client.post("/api/job-application", data=self._form())
        assert resp.status_code == 500
