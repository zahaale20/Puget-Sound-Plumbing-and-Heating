from fastapi import APIRouter, HTTPException
from services.s3_service import S3Service

router = APIRouter(
    prefix="/api/images",
    tags=["Images"]
)

s3_service = S3Service()

@router.get("/{image_name:path}")
async def get_image_url(image_name: str):
    print(f"DEBUG: Requesting image key: {image_name}") # Add this to see your terminal logs
    url = s3_service.get_presigned_url(image_name)
    if not url:
        raise HTTPException(status_code=404, detail=f"Image {image_name} not found in S3")
    return {"url": url}