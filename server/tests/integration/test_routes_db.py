"""End-to-end route tests against the real Postgres in docker-compose.

The unit suite exercises route handlers with `routes.X.get_db_connection`
patched to a fake. That validates orchestration but skips:

- the actual `INSERT INTO "Schedule Online" ...` SQL (table/column names,
  parameter ordering)
- the `ON CONFLICT ON CONSTRAINT redeemed_offers_dedup_unique DO NOTHING
  RETURNING id` clause introduced in migration 0002 — the entire reason
  that migration exists
- the unique constraints actually firing on duplicate submissions
- newsletter unsubscribe deleting the row it claims to delete
- the rate limiter dependency wiring against a real `rate_limits` table

Each test below covers one of those gaps. The only mocked boundaries are
the third-party email SDK and hCaptcha network call (via `ALLOW_CAPTCHA_
BYPASS=true`). Those *are* legitimately external; the database is not.
"""

from __future__ import annotations

import pytest

pytestmark = [pytest.mark.asyncio, pytest.mark.integration]


def _schedule_payload(**overrides):
    payload = {
        "firstName": "Ada",
        "lastName": "Lovelace",
        "phone": "2065551234",
        "email": "ada@example.com",
        "message": "Need a leak fixed",
        "captchaToken": "dev-bypass",
    }
    payload.update(overrides)
    return payload


async def _row_count(db, table: str) -> int:
    async with db.get_db_connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute(f'SELECT COUNT(*) FROM {table}')
            return (await cur.fetchone())[0]


# ---------------------------------------------------------------------------
# /api/schedule
# ---------------------------------------------------------------------------


async def test_schedule_inserts_row_and_returns_sent(integration_app, db) -> None:
    res = integration_app.post("/api/schedule", json=_schedule_payload())
    assert res.status_code == 200, res.text
    assert res.json() == {"success": True, "emailStatus": "sent"}
    assert await _row_count(db, '"Schedule Online"') == 1


async def test_schedule_duplicate_returns_duplicate_response(integration_app, db) -> None:
    payload = _schedule_payload(email="dup@example.com", phone="2065559999")
    first = integration_app.post("/api/schedule", json=payload)
    assert first.status_code == 200

    second = integration_app.post("/api/schedule", json=payload)
    assert second.status_code == 200
    body = second.json()
    assert body["duplicate"] is True
    assert body["emailStatus"] == "skipped"
    # Unique constraint kept us at exactly one row.
    assert await _row_count(db, '"Schedule Online"') == 1


# ---------------------------------------------------------------------------
# /api/newsletter (subscribe + unsubscribe)
# ---------------------------------------------------------------------------


async def test_newsletter_subscribe_then_unsubscribe_round_trip(integration_app, db) -> None:
    sub = integration_app.post(
        "/api/newsletter",
        json={"email": "sub@example.com", "captchaToken": "dev-bypass"},
    )
    assert sub.status_code == 200
    assert sub.json()["emailStatus"] == "sent"
    assert await _row_count(db, '"Newsletter"') == 1

    # Compute the real HMAC token using the route module's secret.
    from routes.newsletter import generate_unsubscribe_token

    token = generate_unsubscribe_token("sub@example.com")
    unsub = integration_app.get(
        "/api/newsletter/unsubscribe",
        params={"email": "sub@example.com", "token": token},
    )
    assert unsub.status_code == 200
    assert await _row_count(db, '"Newsletter"') == 0


async def test_newsletter_duplicate_email_returns_skipped(integration_app, db) -> None:
    payload = {"email": "twice@example.com", "captchaToken": "dev-bypass"}
    integration_app.post("/api/newsletter", json=payload)
    second = integration_app.post("/api/newsletter", json=payload)

    assert second.status_code == 200
    body = second.json()
    assert body["duplicate"] is True
    assert body["emailStatus"] == "skipped"
    assert await _row_count(db, '"Newsletter"') == 1


async def test_newsletter_unsubscribe_rejects_bad_token(integration_app) -> None:
    res = integration_app.get(
        "/api/newsletter/unsubscribe",
        params={"email": "x@example.com", "token": "wrong-token"},
    )
    assert res.status_code == 400


# ---------------------------------------------------------------------------
# /api/redeem-offer  (the migration 0002 + ON CONFLICT path)
# ---------------------------------------------------------------------------


def _offer_payload(**overrides):
    payload = {
        "firstName": "Grace",
        "lastName": "Hopper",
        "phone": "2065552222",
        "email": "grace@example.com",
        "couponDiscount": "$19.50 OFF",
        "couponCondition": "First-time customers",
        "captchaToken": "dev-bypass",
    }
    payload.update(overrides)
    return payload


async def test_redeem_offer_inserts_and_emails_once(integration_app, db) -> None:
    res = integration_app.post("/api/redeem-offer", json=_offer_payload())
    assert res.status_code == 200
    assert res.json() == {"success": True, "emailStatus": "sent"}
    assert await _row_count(db, '"Redeemed Offers"') == 1

    confirm_mock = integration_app.email_mocks["routes.offers.send_coupon_confirmation"]
    assert confirm_mock.await_count == 1


async def test_redeem_offer_dedup_constraint_blocks_second_submission(integration_app, db) -> None:
    """Migration 0002 added a UNIQUE on (email, phone, coupon_discount,
    coupon_condition). The route uses `ON CONFLICT ... DO NOTHING
    RETURNING id` and only emails when a row was actually inserted.
    Without the migration applied, this test would either insert twice
    or send the coupon twice — both regressions worth catching.
    """
    payload = _offer_payload()
    first = integration_app.post("/api/redeem-offer", json=payload)
    second = integration_app.post("/api/redeem-offer", json=payload)

    assert first.status_code == 200
    assert second.status_code == 200
    assert second.json().get("duplicate") is True

    # Exactly one row, exactly one confirmation email.
    assert await _row_count(db, '"Redeemed Offers"') == 1
    confirm_mock = integration_app.email_mocks["routes.offers.send_coupon_confirmation"]
    assert confirm_mock.await_count == 1


async def test_redeem_offer_rolls_back_row_when_email_fails(integration_app, db) -> None:
    """If the coupon email send raises, the just-inserted row must be
    deleted so the customer's retry isn't blocked by the dedup
    constraint. This exercises the real DELETE statement and the dedup
    constraint together — neither is touched by the unit suite.
    """
    integration_app.email_mocks[
        "routes.offers.send_coupon_confirmation"
    ].side_effect = RuntimeError("smtp down")

    res = integration_app.post("/api/redeem-offer", json=_offer_payload())
    assert res.status_code == 500
    assert await _row_count(db, '"Redeemed Offers"') == 0


# ---------------------------------------------------------------------------
# /api/diy-permit
# ---------------------------------------------------------------------------


def _diy_payload(**overrides):
    payload = {
        "firstName": "Linus",
        "lastName": "Torvalds",
        "phone": "2065553333",
        "email": "linus@example.com",
        "address": "123 Kernel Way",
        "city": "Seattle",
        "state": "WA",
        "zipCode": "98101",
        "projectDescription": "Replacing water heater",
        "inspection": "yes",
        "captchaToken": "dev-bypass",
    }
    payload.update(overrides)
    return payload


async def test_diy_permit_inserts_and_dedupes(integration_app, db) -> None:
    first = integration_app.post("/api/diy-permit", json=_diy_payload())
    assert first.status_code == 200
    assert first.json()["emailStatus"] == "sent"
    assert await _row_count(db, '"DIY Permit Requests"') == 1

    second = integration_app.post("/api/diy-permit", json=_diy_payload())
    assert second.status_code == 200
    assert second.json()["duplicate"] is True
    assert await _row_count(db, '"DIY Permit Requests"') == 1


async def test_diy_permit_default_unsure_persists(integration_app, db) -> None:
    payload = _diy_payload(email="unsure@example.com", address="456 Default Ave")
    payload.pop("inspection")

    res = integration_app.post("/api/diy-permit", json=payload)

    assert res.status_code == 200, res.text
    assert res.json()["emailStatus"] == "sent"
    async with db.get_db_connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                'SELECT inspection FROM "DIY Permit Requests" WHERE email = %s',
                ("unsure@example.com",),
            )
            row = await cur.fetchone()
    assert row == ("unsure",)


# ---------------------------------------------------------------------------
# Rate limiter integrated with a real route
# ---------------------------------------------------------------------------


async def test_newsletter_rate_limit_returns_429_after_threshold(integration_app, db) -> None:
    """The newsletter limit is 5 per hour. The 6th request from the same
    IP must be rejected with a 429 — proving the dependency wiring runs
    against the real `rate_limits` table.
    """
    payloads = [
        {"email": f"rate{i}@example.com", "captchaToken": "dev-bypass"}
        for i in range(7)
    ]

    statuses = [integration_app.post("/api/newsletter", json=p).status_code for p in payloads]

    # First 5 succeed, 6th and 7th rate-limited. (Counter increments on
    # check, then route accepts; the 6th check increments to 6 > 5 and
    # is denied.)
    assert statuses[:5] == [200] * 5
    assert statuses[5] == 429
    assert statuses[6] == 429


# ---------------------------------------------------------------------------
# /api/blog  (SELECT and UPDATE … RETURNING against "Blog Posts")
# ---------------------------------------------------------------------------


async def _seed_blog_post(_real_db_module, *, slug: str = "test-post", title: str = "Test Post") -> None:
    """Insert a minimal blog post directly so blog read tests have data."""
    async with _real_db_module.get_db_connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                """
                INSERT INTO public."Blog Posts"
                    (title, slug, source_url, published_date, author,
                     views, content_json, featured_image_s3_key, content_image_s3_keys)
                VALUES (%s, %s, %s, %s, %s, 0, %s::jsonb, %s, %s)
                ON CONFLICT (slug) DO NOTHING
                """,
                (
                    title,
                    slug,
                    "https://example.com",
                    "2026-01-01",
                    "Test Author",
                    '{"description": "A test post", "sections": [], "categories": ["plumbing"]}',
                    "images/test.jpg",
                    ["images/c1.jpg"],
                ),
            )
        await conn.commit()


async def test_blog_list_returns_seeded_post(integration_app, db, _real_db_module) -> None:
    await _seed_blog_post(_real_db_module)

    res = integration_app.get("/api/blog")
    assert res.status_code == 200
    posts = res.json()
    assert len(posts) == 1
    post = posts[0]
    # Verify the column-name mapping in _row_to_post survives a real query.
    assert post["slug"] == "test-post"
    assert post["title"] == "Test Post"
    assert post["author"] == "Test Author"
    assert post["views"] == 0
    assert post["description"] == "A test post"
    assert post["keywords"] == ["plumbing"]
    assert post["featuredImageKey"] == "images/test.jpg"
    assert post["contentImageKeys"] == ["images/c1.jpg"]


async def test_blog_list_empty_when_table_empty(integration_app) -> None:
    res = integration_app.get("/api/blog")
    assert res.status_code == 200
    assert res.json() == []


async def test_blog_get_single_post_by_slug(integration_app, db, _real_db_module) -> None:
    await _seed_blog_post(_real_db_module, slug="single-post", title="Single Post")

    res = integration_app.get("/api/blog/single-post")
    assert res.status_code == 200
    post = res.json()
    assert post["slug"] == "single-post"
    assert post["title"] == "Single Post"


async def test_blog_get_unknown_slug_returns_404(integration_app) -> None:
    res = integration_app.get("/api/blog/does-not-exist")
    assert res.status_code == 404


async def test_blog_increment_views_updates_row(integration_app, db, _real_db_module) -> None:
    await _seed_blog_post(_real_db_module, slug="views-post")

    res = integration_app.post("/api/blog/views-post/views")
    assert res.status_code == 200
    assert res.json() == {"views": 1}

    # A second increment produces 2 — confirms the UPDATE accumulates, not resets.
    res2 = integration_app.post("/api/blog/views-post/views")
    assert res2.status_code == 200
    assert res2.json() == {"views": 2}


async def test_blog_increment_views_unknown_slug_returns_404(integration_app) -> None:
    res = integration_app.post("/api/blog/ghost-post/views")
    assert res.status_code == 404
