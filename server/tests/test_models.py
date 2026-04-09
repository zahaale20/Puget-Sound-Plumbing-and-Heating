import pytest
from pydantic import ValidationError
from models.requests import (
    ScheduleRequest,
    NewsletterRequest,
    RedeemOfferRequest,
    DiyPermitRequest,
)


class TestScheduleRequest:
    def test_valid_request(self):
        req = ScheduleRequest(
            firstName="John",
            lastName="Doe",
            phone="2065551234",
            email="john@example.com",
            message="Need help",
        )
        assert req.firstName == "John"
        assert req.email == "john@example.com"

    def test_minimal_fields(self):
        req = ScheduleRequest(
            firstName="J",
            lastName="D",
            phone="1234567",
            email="a@b.co",
        )
        assert req.message == ""

    def test_invalid_email_rejected(self):
        with pytest.raises(ValidationError):
            ScheduleRequest(
                firstName="John",
                lastName="Doe",
                phone="2065551234",
                email="not-an-email",
            )

    def test_empty_first_name_rejected(self):
        with pytest.raises(ValidationError):
            ScheduleRequest(
                firstName="",
                lastName="Doe",
                phone="2065551234",
                email="john@example.com",
            )

    def test_phone_too_short_rejected(self):
        with pytest.raises(ValidationError):
            ScheduleRequest(
                firstName="John",
                lastName="Doe",
                phone="123",
                email="john@example.com",
            )

    def test_extra_fields_rejected(self):
        with pytest.raises(ValidationError):
            ScheduleRequest(
                firstName="John",
                lastName="Doe",
                phone="2065551234",
                email="john@example.com",
                unknownField="bad",
            )


class TestNewsletterRequest:
    def test_valid(self):
        req = NewsletterRequest(email="user@example.com")
        assert req.email == "user@example.com"
        assert req.captchaToken is None

    def test_invalid_email(self):
        with pytest.raises(ValidationError):
            NewsletterRequest(email="bad")

    def test_with_captcha_token(self):
        req = NewsletterRequest(email="user@test.com", captchaToken="tok123")
        assert req.captchaToken == "tok123"


class TestRedeemOfferRequest:
    def test_valid(self):
        req = RedeemOfferRequest(
            firstName="Jane",
            lastName="Doe",
            phone="2065559999",
            email="jane@test.com",
            couponDiscount="$50 Off",
            couponCondition="Any service over $200",
        )
        assert req.couponDiscount == "$50 Off"

    def test_missing_coupon_fields(self):
        with pytest.raises(ValidationError):
            RedeemOfferRequest(
                firstName="Jane",
                lastName="Doe",
                phone="2065559999",
                email="jane@test.com",
            )


class TestDiyPermitRequest:
    def test_valid_full(self):
        req = DiyPermitRequest(
            firstName="Bob",
            lastName="Smith",
            email="bob@test.com",
            phone="2065551111",
            address="123 Main St",
            city="Seattle",
            state="WA",
            zipCode="98101",
            projectDescription="Fix sink",
            inspection="yes",
        )
        assert req.inspection == "yes"

    def test_defaults(self):
        req = DiyPermitRequest(
            firstName="Bob",
            lastName="Smith",
            email="bob@test.com",
            phone="2065551111",
            address="123 Main St",
        )
        assert req.city == ""
        assert req.state == ""
        assert req.zipCode == ""
        assert req.projectDescription == ""
        assert req.inspection == "unsure"

    def test_invalid_inspection_rejected(self):
        with pytest.raises(ValidationError):
            DiyPermitRequest(
                firstName="Bob",
                lastName="Smith",
                email="bob@test.com",
                phone="2065551111",
                address="123 Main St",
                inspection="maybe",
            )
