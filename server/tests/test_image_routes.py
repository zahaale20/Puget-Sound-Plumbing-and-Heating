from unittest.mock import AsyncMock, patch


def _ok():
    return AsyncMock(return_value=(True, "OK", 0))


def _denied():
    return AsyncMock(return_value=(False, "Limited", 3600))


class TestGetImageUrl:
    def test_valid_image(self, client) -> None:
        with (
            patch("services.rate_limiter.check_rate_limit", _ok()),
            patch("routes.images.storage_service") as mock_svc,
        ):
            mock_svc.supabase_url = "https://test.supabase.co"
            mock_svc.get_image_url.return_value = "https://test.supabase.co/storage/v1/object/public/assets/blog/img.webp"
            resp = client.get("/api/images/blog/img.webp")
        assert resp.status_code == 200
        assert "url" in resp.json()

    def test_invalid_image_path(self, client) -> None:
        with (
            patch("services.rate_limiter.check_rate_limit", _ok()),
            patch("routes.images.storage_service") as mock_svc,
        ):
            mock_svc.supabase_url = "https://test.supabase.co"
            mock_svc.get_image_url.return_value = None
            resp = client.get("/api/images/private/secret.jpg")
        assert resp.status_code == 400

    def test_no_storage_url(self, client) -> None:
        with (
            patch("services.rate_limiter.check_rate_limit", _ok()),
            patch("routes.images.storage_service") as mock_svc,
        ):
            mock_svc.supabase_url = None
            resp = client.get("/api/images/blog/img.webp")
        assert resp.status_code == 404

    def test_rate_limited(self, client) -> None:
        with patch("services.rate_limiter.check_rate_limit", _denied()):
            resp = client.get("/api/images/blog/img.webp")
        assert resp.status_code == 429
