import os
import logging
import re
import uuid
import httpx
from urllib.parse import quote
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


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

    def __init__(self):
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

    def get_image_url(self, object_name: str):
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

    def upload_resume(self, resume_bytes: bytes, resume_filename: str) -> str:
        """Upload a resume to the Supabase 'resumes' bucket."""
        if not self.supabase_url or not self.supabase_secret_key:
            logger.error("Supabase Storage not configured for resume upload")
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

            resp = httpx.post(
                url,
                content=resume_bytes,
                headers={
                    "apikey": self.supabase_secret_key,
                    "Authorization": f"Bearer {self.supabase_secret_key}",
                    "Content-Type": content_type,
                },
                timeout=15.0,
            )

            if resp.status_code not in (200, 201):
                logger.error("Supabase Storage upload failed (%d): %s", resp.status_code, resp.text[:300])
                return None

            storage_key = f"{self.RESUMES_BUCKET}/{obj_path}"
            logger.info("Resume uploaded to Supabase Storage: %s", storage_key)
            return storage_key
        except Exception as e:
            logger.exception("Failed to upload resume: %s", str(e))
            return None