# Server Test Coverage Map

This document maps production modules to their primary test files so missing coverage is easy to identify and prioritize.

## Module -> Test File Ownership

- `database.py`
  - `tests/test_backend_coverage.py` (`TestDatabaseCoverage`)

- `main.py`
  - `tests/test_backend_coverage.py` (`TestMainCoverage`)

- `routes/images.py`
  - `tests/test_backend_coverage.py` (`TestImagesCoverage`)

- `services/rate_limiter.py`
  - `tests/test_services.py` (`TestRateLimiter`)

- `services/s3_service.py`
  - `tests/test_services.py` (`TestS3Service`)

- `models/requests.py`
  - `tests/test_services.py` (`TestModels`)

- `routes/email.py` helper functions
  - `tests/test_services.py` (`TestEmailHelpers`)

- `routes/email.py` core endpoints
  - `tests/test_email_route_core.py`
    - `TestCaptchaEndpoint`
    - `TestSendEmailEndpoint`
    - `TestScheduleEndpoint`
    - `TestNewsletterEndpoint`

- `routes/email.py` unsubscribe endpoint
  - `tests/test_email_route_unsubscribe.py` (`TestUnsubscribeEndpoint`)

- `routes/email.py` redeem-offer + DIY permit endpoints
  - `tests/test_email_route_redeem_and_diy.py`
    - `TestRedeemOfferEndpoint`
    - `TestDiyPermitEndpoint`

- `routes/email.py` job-application endpoint + resume validation helper
  - `tests/test_email_route_job_application.py`
    - `TestJobApplicationEndpoint`
    - `TestResumeValidationHelper`

## Current Known Gaps (High Level)

Based on the latest coverage report, the largest uncovered areas are in `routes/email.py` email rendering/sending helper functions (`_send_*` HTML-template paths and provider payload composition).

## Recommended Next Additions

1. Add payload-level unit tests for `_send_coupon_confirmation_email`, `_send_schedule_notification_email`, and `_send_job_application_email` with `resend.Emails.send` mocked.
2. Add tests for successful redeem-offer and DIY-permit happy paths with full DB + notification sequence assertions.
3. Add tests for unsubscribe path when `deleted == 0` to verify idempotent no-op behavior explicitly.
4. Add tests for filename sanitization edge cases in `_sanitize_resume_filename`.
