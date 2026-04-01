from pydantic import BaseModel
from typing import Optional


class EmailRequest(BaseModel):
    email: str
    firstName: str
    captchaToken: Optional[str] = None


class ScheduleRequest(BaseModel):
    firstName: str
    lastName: str
    phone: str
    email: str
    message: str = ""
    captchaToken: Optional[str] = None


class NewsletterRequest(BaseModel):
    email: str
    captchaToken: Optional[str] = None


class RedeemOfferRequest(BaseModel):
    firstName: str
    lastName: str
    phone: str
    email: str
    couponDiscount: str
    couponDiscount: str
    couponCondition: str
    captchaToken: Optional[str] = None


class DiyPermitRequest(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: str
    address: str
    city: str = ""
    projectDescription: str = ""
    inspection: str = "unsure"
    captchaToken: Optional[str] = None
