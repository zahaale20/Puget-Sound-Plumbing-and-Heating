import os
from dotenv import load_dotenv

load_dotenv()

class S3Service:
    def __init__(self):
        self.cloudfront_url = os.getenv("CLOUDFRONT_URL")
        
        if not self.cloudfront_url:
            print("ERROR: CLOUDFRONT_URL is missing from environment variables!")

    def get_image_url(self, object_name: str):
        # Simply point the user to the CloudFront Edge location
        # This makes the loading near-instant for Seattle users
        if not self.cloudfront_url:
            return None
        
        # Ensure there is no double slash if object_name starts with /
        clean_name = object_name.lstrip('/')
        return f"{self.cloudfront_url}/{clean_name}"