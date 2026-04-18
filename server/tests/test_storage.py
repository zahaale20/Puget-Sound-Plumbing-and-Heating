from services.storage_service import StorageService
from unittest.mock import AsyncMock, MagicMock, patch


class TestGetImageUrl:
    def test_valid_blog_image(self) -> None:
        svc = StorageService()
        svc.supabase_url = "https://test.supabase.co"
        url = svc.get_image_url("blog/my-image.webp")
        assert url is not None
        assert "blog/my-image.webp" in url

    def test_valid_site_image(self) -> None:
        svc = StorageService()
        svc.supabase_url = "https://test.supabase.co"
        url = svc.get_image_url("site/hero.jpg")
        assert url is not None

    def test_valid_logo_image(self) -> None:
        svc = StorageService()
        svc.supabase_url = "https://test.supabase.co"
        url = svc.get_image_url("logo/logo.png")
        assert url is not None

    def test_rejects_path_traversal(self) -> None:
        svc = StorageService()
        svc.supabase_url = "https://test.supabase.co"
        assert svc.get_image_url("blog/../etc/passwd") is None

    def test_rejects_backslash(self) -> None:
        svc = StorageService()
        svc.supabase_url = "https://test.supabase.co"
        assert svc.get_image_url("blog\\image.jpg") is None

    def test_rejects_disallowed_prefix(self) -> None:
        svc = StorageService()
        svc.supabase_url = "https://test.supabase.co"
        assert svc.get_image_url("private/secret.jpg") is None

    def test_empty_name_returns_none(self) -> None:
        svc = StorageService()
        svc.supabase_url = "https://test.supabase.co"
        assert svc.get_image_url("") is None

    def test_none_url_returns_none(self) -> None:
        svc = StorageService()
        svc.supabase_url = None
        assert svc.get_image_url("blog/image.jpg") is None


class TestSafeFilename:
    def test_normal_filename(self) -> None:
        assert StorageService._safe_filename("resume.pdf") == "resume.pdf"

    def test_strips_path(self) -> None:
        assert StorageService._safe_filename("/some/path/resume.pdf") == "resume.pdf"

    def test_sanitizes_special_chars(self) -> None:
        result = StorageService._safe_filename("my resume (1).pdf")
        assert ".." not in result
        assert "/" not in result

    def test_empty_returns_default(self) -> None:
        assert StorageService._safe_filename("") == "resume.pdf"

    def test_none_returns_default(self) -> None:
        assert StorageService._safe_filename(None) == "resume.pdf"  # type: ignore[arg-type]


class TestUploadResume:
    def _service(self):
        svc = StorageService()
        svc.supabase_url = "https://test.supabase.co"
        svc.supabase_secret_key = "secret"
        return svc

    @patch("services.storage_service.uuid.uuid4")
    @patch("services.storage_service.httpx.AsyncClient")
    async def test_upload_resume_success(self, mock_client_cls, mock_uuid) -> None:
        svc = self._service()
        mock_uuid.return_value.hex = "abc123"

        mock_resp = MagicMock(status_code=201, text="ok")
        mock_client = MagicMock()
        mock_client.post = AsyncMock(return_value=mock_resp)

        mock_cm = MagicMock()
        mock_cm.__aenter__ = AsyncMock(return_value=mock_client)
        mock_cm.__aexit__ = AsyncMock(return_value=False)
        mock_client_cls.return_value = mock_cm

        key = await svc.upload_resume(b"bytes", "resume.pdf")
        assert key == "resumes/abc123-resume.pdf"

    @patch("services.storage_service.httpx.AsyncClient")
    async def test_upload_resume_returns_none_on_non_2xx(self, mock_client_cls) -> None:
        svc = self._service()

        mock_resp = MagicMock(status_code=500, text="boom")
        mock_client = MagicMock()
        mock_client.post = AsyncMock(return_value=mock_resp)

        mock_cm = MagicMock()
        mock_cm.__aenter__ = AsyncMock(return_value=mock_client)
        mock_cm.__aexit__ = AsyncMock(return_value=False)
        mock_client_cls.return_value = mock_cm

        key = await svc.upload_resume(b"bytes", "resume.pdf")
        assert key is None

    @patch("services.storage_service.httpx.AsyncClient")
    async def test_upload_resume_retries_on_transient_500(self, mock_client_cls) -> None:
        svc = self._service()

        transient = MagicMock(status_code=500, text="transient")
        success = MagicMock(status_code=201, text="ok")
        mock_client = MagicMock()
        mock_client.post = AsyncMock(side_effect=[transient, transient, success])

        mock_cm = MagicMock()
        mock_cm.__aenter__ = AsyncMock(return_value=mock_client)
        mock_cm.__aexit__ = AsyncMock(return_value=False)
        mock_client_cls.return_value = mock_cm

        with (
            patch("services.storage_service.SUPABASE_MAX_ATTEMPTS", 3),
            patch("services.storage_service.SUPABASE_RETRY_BACKOFF_SEC", 0),
            patch("services.storage_service.SUPABASE_MAX_BACKOFF_SEC", 0),
        ):
            key = await svc.upload_resume(b"bytes", "resume.pdf")

        assert key is not None
        assert mock_client.post.await_count == 3

    async def test_upload_resume_returns_none_when_not_configured(self) -> None:
        svc = StorageService()
        svc.supabase_url = None
        svc.supabase_secret_key = None
        key = await svc.upload_resume(b"bytes", "resume.pdf")
        assert key is None

    @patch("services.storage_service.httpx.AsyncClient", side_effect=Exception("network"))
    async def test_upload_resume_handles_exception(self, _) -> None:
        svc = self._service()
        key = await svc.upload_resume(b"bytes", "resume.pdf")
        assert key is None
