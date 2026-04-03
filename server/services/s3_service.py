import os
import boto3
import logging
import re
import uuid
from urllib.parse import quote
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class S3Service:
    # S3 prefix conventions (folders inside the single bucket):
    #   private/            – private site images (served via CloudFront)
    #   public/             – public site assets
    #   resumes/            – uploaded applicant resumes
    #   blog-posts-images/  – scraped blog post images
    RESUMES_PREFIX = "resumes/"
    BLOG_POSTS_PREFIX = "blog-posts-images/"

    def __init__(self):
        self.cloudfront_url = os.getenv("CLOUDFRONT_URL")
        self.aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.aws_region = os.getenv("AWS_REGION", "us-west-2")
        self.bucket = os.getenv("S3_BUCKET_NAME", "pspah-bucket")
        self.allowed_image_prefixes = tuple(
            prefix.strip().lstrip("/")
            for prefix in os.getenv(
                "ALLOWED_IMAGE_PREFIXES",
                "public/,private/,blog-posts-images/",
            ).split(",")
            if prefix.strip()
        )
        
        if not self.cloudfront_url:
            print("ERROR: CLOUDFRONT_URL is missing from environment variables!")
        
        self.s3_client = None
        if self.aws_access_key_id and self.aws_secret_access_key:
            self.s3_client = boto3.client(
                "s3",
                aws_access_key_id=self.aws_access_key_id,
                aws_secret_access_key=self.aws_secret_access_key,
                region_name=self.aws_region,
            )

    def get_image_url(self, object_name: str):
        # Simply point the user to the CloudFront Edge location
        # This makes the loading near-instant for Seattle users
        if not self.cloudfront_url:
            return None

        clean_name = (object_name or "").strip().lstrip("/")
        if not clean_name or ".." in clean_name or "\\" in clean_name:
            return None

        if not any(clean_name.startswith(prefix) for prefix in self.allowed_image_prefixes):
            return None

        return f"{self.cloudfront_url}/{quote(clean_name, safe='/-_.~')}"

    @staticmethod
    def _safe_filename(filename: str) -> str:
        filename = os.path.basename((filename or "").strip())
        filename = re.sub(r"[^a-zA-Z0-9._-]", "_", filename)
        filename = filename.strip("._")
        return filename or "resume.pdf"
    
    def upload_resume(self, resume_bytes: bytes, resume_filename: str) -> str:
        """Upload resume to the resumes/ prefix in the main S3 bucket."""
        if not self.s3_client:
            logger.error("S3 client not initialized for resume upload")
            return None
        
        try:
            safe_filename = self._safe_filename(resume_filename)
            extension = os.path.splitext(safe_filename)[1].lower()
            content_type = {
                ".pdf": "application/pdf",
                ".doc": "application/msword",
                ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            }.get(extension, "application/octet-stream")

            s3_key = f"{self.RESUMES_PREFIX}{uuid.uuid4().hex}-{safe_filename}"
            self.s3_client.put_object(
                Bucket=self.bucket,
                Key=s3_key,
                Body=resume_bytes,
                ContentType=content_type,
                ServerSideEncryption="AES256",
            )
            logger.info(f"Resume uploaded to S3: {self.bucket}/{s3_key}")
            return s3_key
        except Exception as e:
            logger.exception(f"Failed to upload resume to S3: {str(e)}")
            return None