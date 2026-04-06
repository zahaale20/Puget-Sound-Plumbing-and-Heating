import os
import logging
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from database import get_db_connection
from services.rate_limiter import check_rate_limit

router = APIRouter(prefix="/api/blog", tags=["Blog"])
logger = logging.getLogger(__name__)
TRUST_PROXY_HEADERS = os.getenv("TRUST_PROXY_HEADERS", "false").lower() == "true"

BLOG_CACHE_MAX_AGE = int(os.getenv("BLOG_CACHE_MAX_AGE", "300"))


def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for") if TRUST_PROXY_HEADERS else None
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "0.0.0.0"


def _row_to_post(row: tuple) -> dict:
    """Map a DB row to the blog post shape the client expects."""
    (
        id_, title, slug, source_url, published_date, author,
        views, content_json, featured_image_s3_key, content_image_s3_keys,
    ) = row
    content = content_json or {}
    return {
        "id": id_,
        "title": title or "",
        "slug": slug or "",
        "link": content.get("link") or f"/blog/{slug}",
        "date": published_date or "",
        "author": author or "Puget Sound Plumbing",
        "views": int(views or 0),
        "description": content.get("description") or "",
        "keywords": content.get("categories") if isinstance(content.get("categories"), list) else [],
        "sections": content.get("sections") if isinstance(content.get("sections"), list) else [],
        "featuredImageKey": featured_image_s3_key or "",
        "contentImageKeys": content_image_s3_keys if isinstance(content_image_s3_keys, list) else [],
        "sourceUrl": source_url or "",
    }


@router.get("")
async def list_blog_posts():
    """Return all blog posts ordered by published_date descending."""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, title, slug, source_url, published_date, author,
                           views, content_json, featured_image_s3_key, content_image_s3_keys
                    FROM public."Blog Posts"
                    ORDER BY published_date DESC NULLS LAST
                    """
                )
                rows = cur.fetchall()
        posts = [_row_to_post(row) for row in rows]
        return JSONResponse(
            content=posts,
            headers={"Cache-Control": f"public, s-maxage={BLOG_CACHE_MAX_AGE}, stale-while-revalidate=60"},
        )
    except Exception as e:
        logger.exception("Failed to fetch blog posts: %s", str(e))
        raise HTTPException(status_code=500, detail="Failed to load blog posts")


@router.get("/{slug}")
async def get_blog_post(slug: str):
    """Return a single blog post by slug."""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, title, slug, source_url, published_date, author,
                           views, content_json, featured_image_s3_key, content_image_s3_keys
                    FROM public."Blog Posts"
                    WHERE slug = %s
                    """,
                    (slug,),
                )
                row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Blog post not found")
        return _row_to_post(row)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to fetch blog post '%s': %s", slug, str(e))
        raise HTTPException(status_code=500, detail="Failed to load blog post")


@router.post("/{slug}/views")
async def increment_views(slug: str, req: Request):
    """Increment the view count for a blog post. Rate-limited."""
    client_ip = _get_client_ip(req)
    is_allowed, msg = check_rate_limit(client_ip, "blog-views")
    if not is_allowed:
        raise HTTPException(status_code=429, detail=msg)

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE public."Blog Posts"
                    SET views = views + 1
                    WHERE slug = %s
                    RETURNING views
                    """,
                    (slug,),
                )
                result = cur.fetchone()
                if not result:
                    raise HTTPException(status_code=404, detail="Blog post not found")
                conn.commit()
        return {"views": result[0]}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to increment views for '%s': %s", slug, str(e))
        raise HTTPException(status_code=500, detail="Failed to update views")
