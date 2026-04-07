-- Migration: Rename legacy S3 column names to storage-agnostic names.
-- Run in Supabase SQL editor or via psql.

ALTER TABLE public."Blog Posts"
    RENAME COLUMN featured_image_s3_key TO featured_image_key;

ALTER TABLE public."Blog Posts"
    RENAME COLUMN content_image_s3_keys TO content_image_keys;
