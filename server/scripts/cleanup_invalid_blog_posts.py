#!/usr/bin/env python3
"""Delete blog posts with invalid published_date from Supabase and related images from S3."""

import argparse
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any

import boto3
import psycopg2
from dotenv import load_dotenv


def load_environment() -> None:
    root = Path(__file__).resolve().parents[2]
    load_dotenv(root / "server" / ".env")
    load_dotenv(root / ".env")
    load_dotenv()


def is_valid_date(value: Any) -> bool:
    if value is None:
        return False

    text = str(value).strip()
    if not text:
        return False

    candidates = [text, text.replace(",", ""), text.upper()]
    formats = [
        "%Y-%m-%d",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%S.%f%z",
        "%b %d %Y",
        "%B %d %Y",
        "%b %d, %Y",
        "%B %d, %Y",
        "%d %b %Y",
        "%d %B %Y",
        "%b %d",
        "%B %d",
    ]

    for candidate in candidates:
        try:
            datetime.fromisoformat(candidate.replace("Z", "+00:00"))
            return True
        except ValueError:
            pass

        for fmt in formats:
            try:
                datetime.strptime(candidate, fmt)
                return True
            except ValueError:
                continue

    return False


def get_connection() -> psycopg2.extensions.connection:
    required = [
        "SUPABASE_USER",
        "SUPABASE_PASSWORD",
        "SUPABASE_HOST",
        "SUPABASE_PORT",
        "SUPABASE_DBNAME",
    ]
    missing = [key for key in required if not os.getenv(key)]
    if missing:
        raise RuntimeError(f"Missing required env vars: {', '.join(missing)}")

    return psycopg2.connect(
        user=os.getenv("SUPABASE_USER"),
        password=os.getenv("SUPABASE_PASSWORD"),
        host=os.getenv("SUPABASE_HOST"),
        port=os.getenv("SUPABASE_PORT"),
        dbname=os.getenv("SUPABASE_DBNAME"),
    )


def extract_s3_keys(featured_key: Any, content_keys: Any) -> set[str]:
    keys: set[str] = set()

    if isinstance(featured_key, str) and featured_key.strip():
        keys.add(featured_key.strip())

    if isinstance(content_keys, list):
        for entry in content_keys:
            if isinstance(entry, dict):
                key = entry.get("key")
                if isinstance(key, str) and key.strip():
                    keys.add(key.strip())
            elif isinstance(entry, str) and entry.strip():
                keys.add(entry.strip())

    return keys


def delete_s3_objects(bucket: str, keys: set[str], dry_run: bool) -> int:
    if not keys:
        return 0

    if dry_run:
        print(f"[DRY RUN] Would delete {len(keys)} S3 objects from s3://{bucket}")
        return len(keys)

    aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    aws_region = os.getenv("AWS_REGION", "us-west-2")

    if not aws_access_key_id or not aws_secret_access_key:
        raise RuntimeError("Missing AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY for S3 deletions.")

    s3 = boto3.client(
        "s3",
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        region_name=aws_region,
    )

    deleted = 0
    key_list = sorted(keys)
    for i in range(0, len(key_list), 1000):
        batch = key_list[i : i + 1000]
        response = s3.delete_objects(
            Bucket=bucket,
            Delete={"Objects": [{"Key": key} for key in batch], "Quiet": True},
        )
        deleted += len(response.get("Deleted", []))

    return deleted


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Actually perform deletions. Without this flag, only prints what would be deleted.",
    )
    args = parser.parse_args()

    dry_run = not args.apply
    load_environment()

    conn = get_connection()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                'SELECT slug, published_date, featured_image_s3_key, content_image_s3_keys FROM public."Blog Posts"'
            )
            rows = cur.fetchall()

        invalid_rows = []
        all_keys: set[str] = set()
        for slug, published_date, featured_key, content_keys in rows:
            if not is_valid_date(published_date):
                invalid_rows.append(
                    {
                        "slug": slug,
                        "published_date": published_date,
                        "featured_image_s3_key": featured_key,
                        "content_image_s3_keys": content_keys,
                    }
                )
                all_keys.update(extract_s3_keys(featured_key, content_keys))

        print(f"Total posts scanned: {len(rows)}")
        print(f"Posts with invalid dates: {len(invalid_rows)}")

        if not invalid_rows:
            print("No invalid-date posts found. Nothing to delete.")
            return 0

        print("Invalid posts:")
        for row in invalid_rows:
            print(f"- {row['slug']} | published_date={row['published_date']!r}")

        bucket = os.getenv("S3_BUCKET_NAME", "pspah-bucket")
        deleted_s3_count = delete_s3_objects(bucket=bucket, keys=all_keys, dry_run=dry_run)

        slugs = [row["slug"] for row in invalid_rows]
        if dry_run:
            print(f"[DRY RUN] Would delete {len(slugs)} rows from Supabase table public.\"Blog Posts\"")
        else:
            with conn, conn.cursor() as cur:
                cur.execute('DELETE FROM public."Blog Posts" WHERE slug = ANY(%s)', (slugs,))
            print(f"Deleted {len(slugs)} rows from Supabase.")

        print(f"S3 objects targeted: {len(all_keys)}")
        if dry_run:
            print(f"[DRY RUN] S3 objects that would be deleted: {deleted_s3_count}")
        else:
            print(f"Deleted S3 objects: {deleted_s3_count}")

        print("Done.")
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
