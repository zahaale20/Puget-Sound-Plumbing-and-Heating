#!/usr/bin/env python3
"""
Diagnostic script to test S3 resume bucket connectivity and upload
"""
import os
import sys
from dotenv import load_dotenv
from services.s3_service import S3Service

load_dotenv()

print("=" * 60)
print("S3 RESUME BUCKET DIAGNOSTIC TEST")
print("=" * 60)

# Initialize S3Service
s3 = S3Service()

# Check configuration
print("\n✓ Environment Configuration:")
print(f"  - Images Bucket: {s3.images_bucket}")
print(f"  - Resumes Bucket: {s3.resumes_bucket}")
print(f"  - AWS Region: {s3.aws_region}")
print(f"  - S3 Client Initialized: {s3.s3_client is not None}")

if not s3.s3_client:
    print("\n❌ ERROR: S3 client not initialized!")
    print("   Missing AWS credentials in environment variables")
    sys.exit(1)

# Test bucket access
print("\n✓ Testing Bucket Access:")
try:
    # Try to list buckets
    response = s3.s3_client.list_buckets()
    print(f"  ✅ Can list buckets. Found {len(response['Buckets'])} bucket(s)")
    bucket_names = [b['Name'] for b in response['Buckets']]
    print(f"     Buckets: {', '.join(bucket_names)}")
    
    # Check if resumes bucket exists
    if s3.resumes_bucket in bucket_names:
        print(f"  ✅ Resume bucket '{s3.resumes_bucket}' EXISTS")
    else:
        print(f"  ❌ Resume bucket '{s3.resumes_bucket}' NOT FOUND")
        print(f"     Available buckets: {bucket_names}")
except Exception as e:
    print(f"  ❌ Cannot list buckets: {str(e)}")
    sys.exit(1)

# Test upload
print("\n✓ Testing Resume Upload:")
test_filename = "test_resume.txt"
test_content = b"This is a test resume file"

try:
    result = s3.upload_resume(test_content, test_filename)
    if result:
        print(f"  ✅ Upload succeeded! File stored as: {result}")
    else:
        print(f"  ❌ Upload failed (check logs above)")
except Exception as e:
    print(f"  ❌ Upload error: {str(e)}")
    sys.exit(1)

print("\n" + "=" * 60)
print("DIAGNOSTIC COMPLETE")
print("=" * 60)
