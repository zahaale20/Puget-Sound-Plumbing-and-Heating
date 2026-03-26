import boto3
import os
from botocore.exceptions import ClientError
from dotenv import load_dotenv

load_dotenv()

class S3Service:
    def __init__(self):
        self.bucket_name = os.getenv("S3_BUCKET_NAME")
        self.bucket_alias = os.getenv("S3_ACCESS_POINT_ARN")
        
        if not self.bucket_alias:
            print("ERROR: S3_ACCESS_POINT_ARN is missing from environment variables!")

        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_REGION", "us-west-2")
        )

    def get_presigned_url(self, object_name: str, expiration=3600):
        try:
            return self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': object_name},
                ExpiresIn=expiration
            )
        except ClientError as e:
            print(f"ERROR: {e}")
            return None