from unittest.mock import AsyncMock, patch

from tests.conftest import make_async_cursor, make_async_db


def _ok_rate_limit():
    return AsyncMock(return_value=(True, "OK", 0))


def _denied_rate_limit():
    return AsyncMock(return_value=(False, "Too many", 3600))


class TestListBlogPosts:
    def test_returns_posts(self, client) -> None:
        cur = make_async_cursor(fetchall=[
            (1, "Title", "test-slug", "http://src.com", "2025-01-01", "Author",
             10, {"description": "desc", "sections": [], "categories": ["cat"]},
             "blog/img.webp", ["blog/img2.webp"]),
        ])
        factory, _ = make_async_db(cur)
        with patch("routes.blog.get_db_connection", factory):
            resp = client.get("/api/blog")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["slug"] == "test-slug"
        assert data[0]["title"] == "Title"
        assert data[0]["views"] == 10
        assert data[0]["keywords"] == ["cat"]
        assert "Cache-Control" in resp.headers

    def test_returns_empty_list(self, client) -> None:
        cur = make_async_cursor(fetchall=[])
        factory, _ = make_async_db(cur)
        with patch("routes.blog.get_db_connection", factory):
            resp = client.get("/api/blog")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_db_error_returns_500(self, client) -> None:
        with patch("routes.blog.get_db_connection", side_effect=Exception("db down")):
            resp = client.get("/api/blog")
        assert resp.status_code == 500


class TestGetBlogPost:
    def test_returns_post(self, client) -> None:
        cur = make_async_cursor(fetchone=(
            1, "Title", "test-slug", "", "2025-01-01", "Author",
            5, {"description": "d"}, "blog/img.webp", [],
        ))
        factory, _ = make_async_db(cur)
        with patch("routes.blog.get_db_connection", factory):
            resp = client.get("/api/blog/test-slug")
        assert resp.status_code == 200
        assert resp.json()["slug"] == "test-slug"

    def test_not_found(self, client) -> None:
        cur = make_async_cursor(fetchone=None)
        factory, _ = make_async_db(cur)
        with patch("routes.blog.get_db_connection", factory):
            resp = client.get("/api/blog/no-such-slug")
        assert resp.status_code == 404

    def test_handles_null_fields(self, client) -> None:
        cur = make_async_cursor(fetchone=(
            2, None, "s", None, None, None, None, None, None, None,
        ))
        factory, _ = make_async_db(cur)
        with patch("routes.blog.get_db_connection", factory):
            resp = client.get("/api/blog/s")
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == ""
        assert data["views"] == 0
        assert data["keywords"] == []


class TestIncrementViews:
    def test_increments(self, client) -> None:
        cur = make_async_cursor(fetchone=(11,))
        factory, _ = make_async_db(cur)
        with (
            patch("routes.blog.get_db_connection", factory),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
        ):
            resp = client.post("/api/blog/test-slug/views")
        assert resp.status_code == 200
        assert resp.json()["views"] == 11

    def test_rate_limited(self, client) -> None:
        with patch("services.rate_limiter.check_rate_limit", _denied_rate_limit()):
            resp = client.post("/api/blog/test-slug/views")
        assert resp.status_code == 429

    def test_post_not_found(self, client) -> None:
        cur = make_async_cursor(fetchone=None)
        factory, _ = make_async_db(cur)
        with (
            patch("routes.blog.get_db_connection", factory),
            patch("services.rate_limiter.check_rate_limit", _ok_rate_limit()),
        ):
            resp = client.post("/api/blog/no-slug/views")
        assert resp.status_code == 404
