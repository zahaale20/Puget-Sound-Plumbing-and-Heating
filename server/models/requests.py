from pydantic import BaseModel
from typing import Optional


class EmailRequest(BaseModel):
    email: str
    firstName: str
    recaptchaToken: Optional[str] = None


class ScheduleRequest(BaseModel):
    firstName: str
    lastName: str
    phone: str
    email: str
    message: str = ""
    recaptchaToken: Optional[str] = None


class NewsletterRequest(BaseModel):
    email: str
    recaptchaToken: Optional[str] = None


class RedeemOfferRequest(BaseModel):
    firstName: str
    lastName: str
    phone: str
    email: str
    couponDiscount: str
    couponCondition: str
    recaptchaToken: Optional[str] = None


class DiyPermitRequest(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: str
    address: str
    city: str = ""
    projectDescription: str = ""
    inspection: str = "unsure"
    recaptchaToken: Optional[str] = None
