from fastapi import APIRouter, HTTPException
from services.s3_service import S3Service

router = APIRouter(prefix="/api/images", tags=["Images"])
s3_service = S3Service()

@router.get("/{image_name:path}")
async def get_image_url(image_name: str):
    url = s3_service.get_image_url(image_name)
    if not url:
        raise HTTPException(status_code=404, detail="CloudFront URL configuration missing")
    return {"url": url}