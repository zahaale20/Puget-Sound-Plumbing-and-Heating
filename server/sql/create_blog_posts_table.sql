-- Idempotent schema for storing fully scraped blog post content.
-- Run in Supabase SQL editor or via psql.

DO $$
BEGIN
    IF to_regclass('public."Blog Posts"') IS NULL
       AND to_regclass('public.blog_posts') IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.blog_posts RENAME TO "Blog Posts"';
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public."Blog Posts" (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    source_url TEXT NOT NULL DEFAULT '',
    published_date TEXT,
    author TEXT NOT NULL DEFAULT 'Puget Sound Plumbing',
    views BIGINT NOT NULL DEFAULT 0 CHECK (views >= 0),
    content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    featured_image_s3_key TEXT,
    content_image_s3_keys JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public."Blog Posts"
    DROP COLUMN IF EXISTS source_post_id,
    DROP COLUMN IF EXISTS url,
    DROP COLUMN IF EXISTS link,
    DROP COLUMN IF EXISTS categories,
    DROP COLUMN IF EXISTS description,
    DROP COLUMN IF EXISTS featured_image_url,
    DROP COLUMN IF EXISTS content_images,
    DROP COLUMN IF EXISTS sections;

ALTER TABLE public."Blog Posts"
    ADD COLUMN IF NOT EXISTS source_url TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS content_json JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public."Blog Posts" (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_views_desc ON public."Blog Posts" (views DESC);

CREATE OR REPLACE FUNCTION public.increment_blog_post_views(post_slug TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    next_views BIGINT;
BEGIN
    UPDATE public."Blog Posts"
    SET views = views + 1,
        updated_at = NOW()
    WHERE slug = post_slug
    RETURNING views INTO next_views;

    RETURN next_views;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_blog_posts_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_blog_posts_updated_at ON public."Blog Posts";
CREATE TRIGGER trg_blog_posts_updated_at
BEFORE UPDATE ON public."Blog Posts"
FOR EACH ROW
EXECUTE FUNCTION public.set_blog_posts_updated_at();
