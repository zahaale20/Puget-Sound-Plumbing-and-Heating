
from pydantic import BaseModel, ConfigDict, Field


class RequestModel(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")


class ScheduleRequest(RequestModel):
    firstName: str = Field(min_length=1, max_length=80)
    lastName: str = Field(min_length=1, max_length=80)
    phone: str = Field(min_length=7, max_length=25)
    email: str = Field(min_length=5, max_length=320, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    message: str = Field(default="", max_length=4000)
    captchaToken: str | None = Field(default=None, min_length=1, max_length=4096)


class NewsletterRequest(RequestModel):
    email: str = Field(min_length=5, max_length=320, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    captchaToken: str | None = Field(default=None, min_length=1, max_length=4096)


class CaptchaVerifyRequest(RequestModel):
    # Optional so the handler can return a 400 (not Pydantic's 422) when the
    # token is missing — preserving the documented contract with the frontend.
    token: str | None = Field(default=None, min_length=1, max_length=4096)


class RedeemOfferRequest(RequestModel):
    firstName: str = Field(min_length=1, max_length=80)
    lastName: str = Field(min_length=1, max_length=80)
    phone: str = Field(min_length=7, max_length=25)
    email: str = Field(min_length=5, max_length=320, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    couponDiscount: str = Field(min_length=1, max_length=100)
    couponCondition: str = Field(min_length=1, max_length=500)
    captchaToken: str | None = Field(default=None, min_length=1, max_length=4096)


class DiyPermitRequest(RequestModel):
    firstName: str = Field(min_length=1, max_length=80)
    lastName: str = Field(min_length=1, max_length=80)
    email: str = Field(min_length=5, max_length=320, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    phone: str = Field(min_length=7, max_length=25)
    address: str = Field(min_length=1, max_length=250)
    city: str = Field(default="", max_length=100)
    state: str = Field(default="", max_length=100)
    zipCode: str = Field(default="", max_length=20)
    projectDescription: str = Field(default="", max_length=4000)
    inspection: str = Field(default="unsure", pattern=r"^(yes|no|unsure)$")
    captchaToken: str | None = Field(default=None, min_length=1, max_length=4096)
