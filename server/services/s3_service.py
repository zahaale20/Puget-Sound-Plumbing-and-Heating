import os
import boto3
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class S3Service:
    def __init__(self):
        self.cloudfront_url = os.getenv("CLOUDFRONT_URL")
        self.aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.aws_region = os.getenv("AWS_REGION", "us-west-2")
        self.images_bucket = os.getenv("S3_MEDIA_BUCKET_NAME", "pspah-bucket")
        self.resumes_bucket = os.getenv("S3_RESUMES_BUCKET", "pspah-resumes-bucket")
        
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
        
        # Ensure there is no double slash if object_name starts with /
        clean_name = object_name.lstrip('/')
        return f"{self.cloudfront_url}/{clean_name}"
    
    def upload_resume(self, resume_bytes: bytes, resume_filename: str) -> str:
        """Upload resume to separate S3 bucket and return filename for reference."""
        if not self.s3_client:
            logger.error("S3 client not initialized for resume upload")
            return None
        
        try:
            # Use filename as-is in S3 (with timestamp prefix for uniqueness if needed)
            self.s3_client.put_object(
                Bucket=self.resumes_bucket,
                Key=resume_filename,
                Body=resume_bytes,
                ContentType="application/pdf" if resume_filename.endswith(".pdf") else "application/octet-stream",
            )
            logger.info(f"Resume uploaded to S3: {self.resumes_bucket}/{resume_filename}")
            return resume_filename
        except Exception as e:
            logger.exception(f"Failed to upload resume to S3: {str(e)}")
            return None