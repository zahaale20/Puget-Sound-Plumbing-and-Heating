"""Tests for the blog API routes."""

from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient


def _client():
    from main import app
    return TestClient(app, base_url="http://localhost")


def _sample_row():
    return (
        7,                          # id
        "Pipe Winterization",       # title
        "pipe-winterization",       # slug
        "https://example.com/post", # source_url
        "2026-01-15",               # published_date
        "PSPAH",                    # author
        12,                         # views
        {"description": "Tips", "categories": ["Plumbing"], "sections": ["A"]},  # content_json
        "blog-posts-images/1.jpg",  # featured_image_s3_key
        ["blog-posts-images/2.jpg"],  # content_image_s3_keys
    )


class _FakeCursor:
    def __init__(self, rows=None, single=None):
        self._rows = rows
        self._single = single

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def execute(self, query, params=None):
        pass

    def fetchall(self):
        return self._rows or []

    def fetchone(self):
        return self._single


class _FakeConnection:
    def __init__(self, cursor):
        self._cursor = cursor
        self.commit = MagicMock()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def cursor(self):
        return self._cursor


class TestListBlogPosts:
    def test_returns_posts(self, monkeypatch):
        import routes.blog as mod

        cursor = _FakeCursor(rows=[_sample_row()])
        conn = _FakeConnection(cursor)
        monkeypatch.setattr(mod, "get_db_connection", lambda: conn)

        response = _client().get("/api/blog")

        assert response.status_code == 200
        posts = response.json()
        assert len(posts) == 1
        assert posts[0]["title"] == "Pipe Winterization"
        assert posts[0]["slug"] == "pipe-winterization"
        assert posts[0]["description"] == "Tips"
        assert posts[0]["keywords"] == ["Plumbing"]
        assert "cache-control" in response.headers

    def test_returns_empty_list(self, monkeypatch):
        import routes.blog as mod

        cursor = _FakeCursor(rows=[])
        conn = _FakeConnection(cursor)
        monkeypatch.setattr(mod, "get_db_connection", lambda: conn)

        response = _client().get("/api/blog")

        assert response.status_code == 200
        assert response.json() == []

    def test_returns_500_on_db_error(self, monkeypatch):
        import routes.blog as mod

        def _raise():
            raise RuntimeError("connection refused")

        monkeypatch.setattr(mod, "get_db_connection", _raise)

        response = _client().get("/api/blog")
        assert response.status_code == 500


class TestGetBlogPost:
    def test_returns_single_post(self, monkeypatch):
        import routes.blog as mod

        cursor = _FakeCursor(single=_sample_row())
        conn = _FakeConnection(cursor)
        monkeypatch.setattr(mod, "get_db_connection", lambda: conn)

        response = _client().get("/api/blog/pipe-winterization")

        assert response.status_code == 200
        assert response.json()["slug"] == "pipe-winterization"

    def test_returns_404_for_missing_post(self, monkeypatch):
        import routes.blog as mod

        cursor = _FakeCursor(single=None)
        conn = _FakeConnection(cursor)
        monkeypatch.setattr(mod, "get_db_connection", lambda: conn)

        response = _client().get("/api/blog/nonexistent")

        assert response.status_code == 404


class TestIncrementViews:
    def test_increments_and_returns_views(self, monkeypatch):
        import routes.blog as mod

        cursor = _FakeCursor(single=(13,))
        conn = _FakeConnection(cursor)
        monkeypatch.setattr(mod, "get_db_connection", lambda: conn)
        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, ep: (True, "OK"))

        response = _client().post("/api/blog/pipe-winterization/views")

        assert response.status_code == 200
        assert response.json()["views"] == 13
        conn.commit.assert_called_once()

    def test_returns_404_for_missing_slug(self, monkeypatch):
        import routes.blog as mod

        cursor = _FakeCursor(single=None)
        conn = _FakeConnection(cursor)
        monkeypatch.setattr(mod, "get_db_connection", lambda: conn)
        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, ep: (True, "OK"))

        response = _client().post("/api/blog/nonexistent/views")

        assert response.status_code == 404

    def test_rate_limited(self, monkeypatch):
        import routes.blog as mod

        monkeypatch.setattr(mod, "check_rate_limit", lambda ip, ep: (False, "Rate limit exceeded"))

        response = _client().post("/api/blog/some-post/views")

        assert response.status_code == 429
