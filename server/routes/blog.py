import logging
import os
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import JSONResponse

from database import get_db_connection
from dependencies import require_rate_limit

router = APIRouter(prefix="/api/blog", tags=["Blog"])
logger = logging.getLogger(__name__)

BLOG_CACHE_MAX_AGE = int(os.getenv("BLOG_CACHE_MAX_AGE", "300"))
# Hard ceiling on a single blog list response. Page size is bounded so the
# endpoint cannot return an arbitrarily large payload as the table grows.
BLOG_LIST_DEFAULT_LIMIT = 100
BLOG_LIST_MAX_LIMIT = 200


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


@router.get("", response_model=None)
async def list_blog_posts(
    limit: int = Query(BLOG_LIST_DEFAULT_LIMIT, ge=1, le=BLOG_LIST_MAX_LIMIT),
    offset: int = Query(0, ge=0),
) -> dict[str, Any] | JSONResponse:
    """Return blog posts ordered by published_date descending.

    Bounded by `limit` (default 100, max 200) and offset for pagination.
    Defaults preserve the existing client behaviour of "give me everything"
    for the typical case where the blog has < 100 posts.
    """
    try:
        async with get_db_connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    SELECT id, title, slug, source_url, published_date, author,
                           views, content_json, featured_image_s3_key, content_image_s3_keys
                    FROM public."Blog Posts"
                    ORDER BY published_date DESC NULLS LAST
                    LIMIT %s OFFSET %s
                    """,
                    (limit, offset),
                )
                rows = await cur.fetchall()
        posts = [_row_to_post(row) for row in rows]
        return JSONResponse(
            content=posts,
            headers={"Cache-Control": f"public, s-maxage={BLOG_CACHE_MAX_AGE}, stale-while-revalidate=60"},
        )
    except Exception as e:
        logger.exception("Failed to fetch blog posts: %s", str(e))
        raise HTTPException(status_code=500, detail="Failed to load blog posts") from e


@router.get("/{slug}", response_model=None)
async def get_blog_post(slug: str) -> dict[str, Any] | JSONResponse:
    """Return a single blog post by slug."""
    try:
        async with get_db_connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    SELECT id, title, slug, source_url, published_date, author,
                           views, content_json, featured_image_s3_key, content_image_s3_keys
                    FROM public."Blog Posts"
                    WHERE slug = %s
                    """,
                    (slug,),
                )
                row = await cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Blog post not found")
        return JSONResponse(
            content=_row_to_post(row),
            headers={"Cache-Control": f"public, s-maxage={BLOG_CACHE_MAX_AGE}, stale-while-revalidate=60"},
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to fetch blog post '%s': %s", slug, str(e))
        raise HTTPException(status_code=500, detail="Failed to load blog post") from e


@router.post("/{slug}/views", dependencies=[Depends(require_rate_limit("blog-views"))])
async def increment_views(slug: str, req: Request) -> dict[str, Any]:
    """Increment the view count for a blog post. Rate-limited."""
    try:
        async with get_db_connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    UPDATE public."Blog Posts"
                    SET views = views + 1
                    WHERE slug = %s
                    RETURNING views
                    """,
                    (slug,),
                )
                result = await cur.fetchone()
                if not result:
                    raise HTTPException(status_code=404, detail="Blog post not found")
            await conn.commit()
        return {"views": result[0]}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to increment views for '%s': %s", slug, str(e))
        raise HTTPException(status_code=500, detail="Failed to update views") from e
