from fastapi import APIRouter, HTTPException, Request
from services.storage_service import StorageService
from services.rate_limiter import check_rate_limit
from dependencies import get_client_ip

router = APIRouter(prefix="/api/images", tags=["Images"])
storage_service = StorageService()


@router.get("/{image_name:path}")
async def get_image_url(image_name: str, req: Request = None):
    if req:
        client_ip = get_client_ip(req)
        is_allowed, rate_limit_msg = check_rate_limit(client_ip, "images")
        if not is_allowed:
            raise HTTPException(status_code=429, detail=rate_limit_msg)

    if not storage_service.supabase_url:
        raise HTTPException(status_code=404, detail="Storage URL configuration missing")

    url = storage_service.get_image_url(image_name)
    if not url:
        raise HTTPException(status_code=400, detail="Invalid image path")
    return {"url": url}