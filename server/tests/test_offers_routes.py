from unittest.mock import AsyncMock, patch

from tests.conftest import make_async_cursor, make_async_db


def _ok_rate_limit():
    return AsyncMock(return_value=(True, "OK", 0))


def _denied_rate_limit():
    return AsyncMock(return_value=(False, "Too many", 3600))


class TestOffersRoute:
    def _payload(self):
        return {
            "firstName": "Jim",
            "lastName": "Beam",
            "phone": "2065551111",
            "email": "jim@example.com",
            "couponDiscount": "$49.99 OFF",
            "couponCondition": "On any service",
            "captchaToken": "tok",
        }

    def test_success(self, client) -> None:
        cur = make_async_cursor(fetchone=(123,))
        factory, _ = make_async_db(cur)
        with (
            patch("routes.offers.get_db_connection", factory),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.offers.verify_captcha", new_callable=AsyncMock, return_value=True),
            patch("routes.offers.send_coupon_confirmation", new_callable=AsyncMock),
            patch("routes.offers.send_coupon_notification", new_callable=AsyncMock),
        ):
            resp = client.post("/api/redeem-offer", json=self._payload())
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    def test_rate_limited(self, client) -> None:
        with patch("services.rate_limiter.check_rate_limit", _denied_rate_limit()):
            resp = client.post("/api/redeem-offer", json=self._payload())
        assert resp.status_code == 429

    def test_captcha_failed(self, client) -> None:
        with (
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.offers.verify_captcha", new_callable=AsyncMock, return_value=False),
        ):
            resp = client.post("/api/redeem-offer", json=self._payload())
        assert resp.status_code == 403

    def test_duplicate_when_insert_returns_none(self, client) -> None:
        cur = make_async_cursor(fetchone=None)
        factory, _ = make_async_db(cur)
        with (
            patch("routes.offers.get_db_connection", factory),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.offers.verify_captcha", new_callable=AsyncMock, return_value=True),
        ):
            resp = client.post("/api/redeem-offer", json=self._payload())
        assert resp.status_code == 200
        assert resp.json()["duplicate"] is True

    def test_email_send_failure_rolls_back_and_returns_500(self, client) -> None:
        insert_cur = make_async_cursor(fetchone=(999,))
        delete_cur = make_async_cursor()
        insert_factory, _ = make_async_db(insert_cur)
        delete_factory, _ = make_async_db(delete_cur)

        with (
            patch(
                "routes.offers.get_db_connection",
                side_effect=[insert_factory(), delete_factory()],
            ),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
            patch("routes.offers.verify_captcha", new_callable=AsyncMock, return_value=True),
            patch(
                "routes.offers.send_coupon_confirmation",
                new_callable=AsyncMock,
                side_effect=Exception("smtp down"),
            ),
        ):
            resp = client.post("/api/redeem-offer", json=self._payload())
        assert resp.status_code == 500

    def test_validation_error(self, client) -> None:
        payload = self._payload()
        payload["email"] = "bad-email"
        with patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()):
            resp = client.post("/api/redeem-offer", json=payload)
        assert resp.status_code == 422

    def test_generate_coupon_id_parses_money_format(self) -> None:
        from routes.offers import generate_coupon_id

        with patch("routes.offers.secrets.token_hex", return_value="abc123"):
            coupon_id = generate_coupon_id("$19.50 OFF")
        assert coupon_id == "PSPAH-1950-abc123"

    def test_generate_coupon_id_fallback_hash_format(self) -> None:
        from routes.offers import generate_coupon_id

        with patch("routes.offers.secrets.token_hex", return_value="abc123"):
            coupon_id = generate_coupon_id("DISCOUNT")
        assert coupon_id.startswith("PSPAH-")
        assert coupon_id.endswith("-abc123")
