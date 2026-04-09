import os
from unittest.mock import patch
from services.storage_service import StorageService


class TestGetImageUrl:
    def test_valid_blog_image(self):
        svc = StorageService()
        svc.supabase_url = "https://test.supabase.co"
        url = svc.get_image_url("blog/my-image.webp")
        assert url is not None
        assert "blog/my-image.webp" in url

    def test_valid_site_image(self):
        svc = StorageService()
        svc.supabase_url = "https://test.supabase.co"
        url = svc.get_image_url("site/hero.jpg")
        assert url is not None

    def test_valid_logo_image(self):
        svc = StorageService()
        svc.supabase_url = "https://test.supabase.co"
        url = svc.get_image_url("logo/logo.png")
        assert url is not None

    def test_rejects_path_traversal(self):
        svc = StorageService()
        svc.supabase_url = "https://test.supabase.co"
        assert svc.get_image_url("blog/../etc/passwd") is None

    def test_rejects_backslash(self):
        svc = StorageService()
        svc.supabase_url = "https://test.supabase.co"
        assert svc.get_image_url("blog\\image.jpg") is None

    def test_rejects_disallowed_prefix(self):
        svc = StorageService()
        svc.supabase_url = "https://test.supabase.co"
        assert svc.get_image_url("private/secret.jpg") is None

    def test_empty_name_returns_none(self):
        svc = StorageService()
        svc.supabase_url = "https://test.supabase.co"
        assert svc.get_image_url("") is None

    def test_none_url_returns_none(self):
        svc = StorageService()
        svc.supabase_url = None
        assert svc.get_image_url("blog/image.jpg") is None


class TestSafeFilename:
    def test_normal_filename(self):
        assert StorageService._safe_filename("resume.pdf") == "resume.pdf"

    def test_strips_path(self):
        assert StorageService._safe_filename("/some/path/resume.pdf") == "resume.pdf"

    def test_sanitizes_special_chars(self):
        result = StorageService._safe_filename("my resume (1).pdf")
        assert ".." not in result
        assert "/" not in result

    def test_empty_returns_default(self):
        assert StorageService._safe_filename("") == "resume.pdf"

    def test_none_returns_default(self):
        assert StorageService._safe_filename(None) == "resume.pdf"
