from unittest.mock import AsyncMock, patch

from tests.conftest import make_async_cursor, make_async_db


class _FakeUndefinedObject(Exception):
    """Simulates psycopg's UndefinedObject (SQLSTATE 42704).

    Production has not yet had ``alembic upgrade head`` run for migration
    0002_offers_dedup_unique, so the named constraint referenced by
    ``ON CONFLICT ON CONSTRAINT redeemed_offers_dedup_unique`` is missing
    and Postgres raises this. Tests need to assert the route falls back
    rather than 500'ing.
    """

    sqlstate = "42704"


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

    def test_falls_back_when_dedup_constraint_missing(self, client) -> None:
        """Production fix: missing migration 0002 must not cause HTTP 500.

        The primary INSERT raises SQLSTATE 42704 (constraint not yet
        applied); the route should transparently fall back to the
        advisory-locked SELECT-then-INSERT path and still send the
        coupon email.
        """
        primary_cur = make_async_cursor(
            execute_side_effect=_FakeUndefinedObject(
                'constraint "redeemed_offers_dedup_unique" for table '
                '"Redeemed Offers" does not exist'
            )
        )
        primary_factory, _ = make_async_db(primary_cur)
        # Fallback executes 3 statements (advisory lock, SELECT, INSERT)
        # and fetchone() is called twice (existing-check then RETURNING).
        # The mock returns the same value for every fetchone, so seed it
        # with a 2-tuple sequence via side_effect.
        fallback_cur = make_async_cursor()
        fallback_cur.fetchone = AsyncMock(side_effect=[None, (777,)])
        fallback_factory, _ = make_async_db(fallback_cur)

        confirmation = AsyncMock()
        with (
            patch(
                "routes.offers.get_db_connection",
                side_effect=[primary_factory(), fallback_factory()],
            ),
            patch(
                "services.rate_limiter.check_rate_limit",
                AsyncMock(return_value=(True, "OK", 0)),
            ),
            patch(
                "routes.offers.verify_captcha",
                new_callable=AsyncMock,
                return_value=True,
            ),
            patch("routes.offers.send_coupon_confirmation", confirmation),
            patch("routes.offers.send_coupon_notification", new_callable=AsyncMock),
        ):
            resp = client.post("/api/redeem-offer", json=self._payload())

        assert resp.status_code == 200, resp.text
        assert resp.json()["success"] is True
        assert confirmation.await_count == 1

    def test_fallback_detects_existing_row_and_returns_duplicate(self, client) -> None:
        """When the constraint is missing AND a prior redemption exists,
        the fallback's pre-insert SELECT must short-circuit and the
        client must see the duplicate response — not a fresh email and
        not a 500."""
        primary_cur = make_async_cursor(
            execute_side_effect=_FakeUndefinedObject("constraint missing")
        )
        primary_factory, _ = make_async_db(primary_cur)
        fallback_cur = make_async_cursor()
        # Existing row found by SELECT inside the locked transaction.
        fallback_cur.fetchone = AsyncMock(side_effect=[(42,)])
        fallback_factory, _ = make_async_db(fallback_cur)

        confirmation = AsyncMock()
        with (
            patch(
                "routes.offers.get_db_connection",
                side_effect=[primary_factory(), fallback_factory()],
            ),
            patch(
                "services.rate_limiter.check_rate_limit",
                AsyncMock(return_value=(True, "OK", 0)),
            ),
            patch(
                "routes.offers.verify_captcha",
                new_callable=AsyncMock,
                return_value=True,
            ),
            patch("routes.offers.send_coupon_confirmation", confirmation),
        ):
            resp = client.post("/api/redeem-offer", json=self._payload())

        assert resp.status_code == 200
        body = resp.json()
        assert body["duplicate"] is True
        assert confirmation.await_count == 0

    def test_generate_coupon_id_fallback_hash_format(self) -> None:
        from routes.offers import generate_coupon_id

        with patch("routes.offers.secrets.token_hex", return_value="abc123"):
            coupon_id = generate_coupon_id("DISCOUNT")
        assert coupon_id.startswith("PSPAH-")
        assert coupon_id.endswith("-abc123")
