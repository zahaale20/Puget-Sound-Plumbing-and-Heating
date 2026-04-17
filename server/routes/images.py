from fastapi import APIRouter, Depends, HTTPException, Request
from services.storage_service import StorageService
from dependencies import require_rate_limit

router = APIRouter(prefix="/api/images", tags=["Images"])
storage_service = StorageService()


@router.get("/{image_name:path}", dependencies=[Depends(require_rate_limit("images"))])
async def get_image_url(image_name: str, req: Request = None):
    if not storage_service.supabase_url:
        raise HTTPException(status_code=404, detail="Storage URL configuration missing")

    url = storage_service.get_image_url(image_name)
    if not url:
        raise HTTPException(status_code=400, detail="Invalid image path")
    return {"url": url}