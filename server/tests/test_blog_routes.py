from unittest.mock import patch, MagicMock
from contextlib import contextmanager


def _mock_db_ctx(mock_cursor):
    mock_conn = MagicMock()
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    @contextmanager
    def _ctx():
        yield mock_conn

    return _ctx


class TestListBlogPosts:
    def test_returns_posts(self, client):
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = [
            (1, "Title", "test-slug", "http://src.com", "2025-01-01", "Author",
             10, {"description": "desc", "sections": [], "categories": ["cat"]},
             "blog/img.webp", ["blog/img2.webp"]),
        ]
        with patch("routes.blog.get_db_connection", _mock_db_ctx(mock_cursor)):
            resp = client.get("/api/blog")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["slug"] == "test-slug"
        assert data[0]["title"] == "Title"
        assert data[0]["views"] == 10
        assert data[0]["keywords"] == ["cat"]
        assert "Cache-Control" in resp.headers

    def test_returns_empty_list(self, client):
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = []
        with patch("routes.blog.get_db_connection", _mock_db_ctx(mock_cursor)):
            resp = client.get("/api/blog")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_db_error_returns_500(self, client):
        with patch("routes.blog.get_db_connection", side_effect=Exception("db down")):
            resp = client.get("/api/blog")
        assert resp.status_code == 500


class TestGetBlogPost:
    def test_returns_post(self, client):
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = (
            1, "Title", "test-slug", "", "2025-01-01", "Author",
            5, {"description": "d"}, "blog/img.webp", [],
        )
        with patch("routes.blog.get_db_connection", _mock_db_ctx(mock_cursor)):
            resp = client.get("/api/blog/test-slug")
        assert resp.status_code == 200
        assert resp.json()["slug"] == "test-slug"

    def test_not_found(self, client):
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = None
        with patch("routes.blog.get_db_connection", _mock_db_ctx(mock_cursor)):
            resp = client.get("/api/blog/no-such-slug")
        assert resp.status_code == 404

    def test_handles_null_fields(self, client):
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = (
            2, None, "s", None, None, None, None, None, None, None,
        )
        with patch("routes.blog.get_db_connection", _mock_db_ctx(mock_cursor)):
            resp = client.get("/api/blog/s")
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == ""
        assert data["views"] == 0
        assert data["keywords"] == []


class TestIncrementViews:
    def test_increments(self, client):
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = (11,)
        with (
            patch("routes.blog.get_db_connection", _mock_db_ctx(mock_cursor)),
            patch("routes.blog.check_rate_limit", return_value=(True, "OK")),
        ):
            resp = client.post("/api/blog/test-slug/views")
        assert resp.status_code == 200
        assert resp.json()["views"] == 11

    def test_rate_limited(self, client):
        with patch("routes.blog.check_rate_limit", return_value=(False, "Too many")):
            resp = client.post("/api/blog/test-slug/views")
        assert resp.status_code == 429

    def test_post_not_found(self, client):
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = None
        with (
            patch("routes.blog.get_db_connection", _mock_db_ctx(mock_cursor)),
            patch("routes.blog.check_rate_limit", return_value=(True, "OK")),
        ):
            resp = client.post("/api/blog/no-slug/views")
        assert resp.status_code == 404
