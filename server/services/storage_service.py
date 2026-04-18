import logging
import os
import re
import uuid
from urllib.parse import quote

import httpx
from dotenv import load_dotenv

from services.resilience import CircuitBreaker, retry_async

load_dotenv()
logger = logging.getLogger(__name__)

SUPABASE_TIMEOUT_SEC = float(os.getenv("SUPABASE_TIMEOUT_SEC", "15"))
SUPABASE_MAX_ATTEMPTS = int(os.getenv("SUPABASE_MAX_ATTEMPTS", "3"))
SUPABASE_RETRY_BACKOFF_SEC = float(os.getenv("SUPABASE_RETRY_BACKOFF_SEC", "0.3"))
SUPABASE_MAX_BACKOFF_SEC = float(os.getenv("SUPABASE_MAX_BACKOFF_SEC", "2"))
SUPABASE_CB_FAILURE_THRESHOLD = int(os.getenv("SUPABASE_CB_FAILURE_THRESHOLD", "3"))
SUPABASE_CB_OPEN_SEC = float(os.getenv("SUPABASE_CB_OPEN_SEC", "20"))

_supabase_breaker = CircuitBreaker(
    name="supabase-storage",
    failure_threshold=SUPABASE_CB_FAILURE_THRESHOLD,
    recovery_timeout_sec=SUPABASE_CB_OPEN_SEC,
)


class StorageService:
    """Supabase Storage client for file uploads and public URL generation.

    Single public bucket layout:
      assets/site/       – site UI images
      assets/logo/       – logos
      assets/blog/       – blog featured & content images
    Private bucket:
      resumes/           – applicant resumes
    """

    ASSETS_BUCKET = "assets"
    RESUMES_BUCKET = "resumes"

    ALLOWED_IMAGE_PREFIXES = ("blog/", "site/", "logo/")

    def __init__(self) -> None:
        project_id = os.getenv("SUPABASE_PROJECT_ID")
        self.supabase_url = f"https://{project_id}.supabase.co" if project_id else None
        self.supabase_secret_key = os.getenv("SUPABASE_SECRET_KEY")

        if not self.supabase_url:
            logger.error("SUPABASE_PROJECT_ID is missing from environment variables")
        if not self.supabase_secret_key:
            logger.error("SUPABASE_SECRET_KEY is missing from environment variables")

    def _storage_public_url(self, bucket: str, path: str) -> str:
        """Build the public URL for a Supabase Storage object."""
        clean = path.strip().lstrip("/")
        return f"{self.supabase_url}/storage/v1/object/public/{bucket}/{quote(clean, safe='/-_.~')}"

    def get_image_url(self, object_name: str) -> str | None:
        """Resolve an image key to a Supabase Storage public URL."""
        if not self.supabase_url:
            return None

        clean_name = (object_name or "").strip().lstrip("/")
        if not clean_name or ".." in clean_name or "\\" in clean_name:
            return None

        if not any(clean_name.startswith(p) for p in self.ALLOWED_IMAGE_PREFIXES):
            return None

        return self._storage_public_url(self.ASSETS_BUCKET, clean_name)

    @staticmethod
    def _safe_filename(filename: str) -> str:
        filename = os.path.basename((filename or "").strip())
        filename = re.sub(r"[^a-zA-Z0-9._-]", "_", filename)
        filename = filename.strip("._")
        return filename or "resume.pdf"

    async def upload_resume(self, resume_bytes: bytes, resume_filename: str) -> str | None:
        """Upload a resume to the Supabase 'resumes' bucket.

        Async to keep the event loop free during the upload round-trip
        (see ADR 0002).
        """
        if not self.supabase_url or not self.supabase_secret_key:
            logger.error("Supabase Storage not configured for resume upload")
            return None

        if not _supabase_breaker.allow_request():
            logger.warning("Supabase Storage circuit open; failing fast")
            return None

        try:
            safe_filename = self._safe_filename(resume_filename)
            extension = os.path.splitext(safe_filename)[1].lower()
            content_type = {
                ".pdf": "application/pdf",
                ".doc": "application/msword",
                ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            }.get(extension, "application/octet-stream")

            obj_path = f"{uuid.uuid4().hex}-{safe_filename}"
            url = f"{self.supabase_url}/storage/v1/object/{self.RESUMES_BUCKET}/{obj_path}"

            def _should_retry(exc: Exception) -> bool:
                if isinstance(exc, (httpx.TimeoutException, httpx.RequestError)):
                    return True
                if isinstance(exc, httpx.HTTPStatusError) and exc.response is not None:
                    return exc.response.status_code == 429 or exc.response.status_code >= 500
                return False

            async def _attempt_upload() -> httpx.Response:
                assert self.supabase_secret_key is not None
                async with httpx.AsyncClient(timeout=SUPABASE_TIMEOUT_SEC) as client:
                    response = await client.post(
                        url,
                        content=resume_bytes,
                        headers={
                            "apikey": self.supabase_secret_key,
                            "Authorization": f"Bearer {self.supabase_secret_key}",
                            "Content-Type": content_type,
                        },
                    )
                if response.status_code in (429,) or response.status_code >= 500:
                    raise httpx.HTTPStatusError(
                        "Supabase transient upload error",
                        request=response.request,
                        response=response,
                    )
                return response

            resp = await retry_async(
                _attempt_upload,
                attempts=SUPABASE_MAX_ATTEMPTS,
                initial_backoff_sec=SUPABASE_RETRY_BACKOFF_SEC,
                max_backoff_sec=SUPABASE_MAX_BACKOFF_SEC,
                should_retry=_should_retry,
                operation_name="Supabase resume upload",
            )

            if resp.status_code not in (200, 201):
                logger.error("Supabase Storage upload failed (%d): %s", resp.status_code, resp.text[:300])
                return None

            storage_key = f"{self.RESUMES_BUCKET}/{obj_path}"
            logger.info("Resume uploaded to Supabase Storage: %s", storage_key)
            _supabase_breaker.record_success()
            return storage_key
        except httpx.HTTPError as e:
            _supabase_breaker.record_failure()
            logger.exception("Failed to upload resume due to network/HTTP error: %s", str(e))
            return None
        except Exception as e:
            _supabase_breaker.record_failure()
            logger.exception("Failed to upload resume: %s", str(e))
            return None