#!/usr/bin/env python3
"""Normalize blog post categories so DB values align with UI dropdown options."""

import argparse
import os
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import Json


def load_environment() -> None:
    root = Path(__file__).resolve().parents[2]
    load_dotenv(root / "server" / ".env")
    load_dotenv(root / ".env")
    load_dotenv()


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


def normalize_key(value: str) -> str:
    return " ".join(value.split()).strip().casefold()


def clean_category(value: Any) -> str:
    if not isinstance(value, str):
        return ""
    return " ".join(value.split()).strip()


def choose_canonical(variants: Counter) -> str:
    # Prefer most common label; tie-break by shorter, then alphabetic for stability.
    return sorted(variants.items(), key=lambda item: (-item[1], len(item[0]), item[0]))[0][0]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Write normalized categories back to Supabase. Without this flag, only show proposed changes.",
    )
    args = parser.parse_args()
    dry_run = not args.apply

    load_environment()
    conn = get_connection()

    try:
        with conn, conn.cursor() as cur:
            cur.execute('SELECT id, slug, content_json FROM public."Blog Posts" ORDER BY id')
            rows = cur.fetchall()

        variants_by_norm: dict[str, Counter] = defaultdict(Counter)
        for _, _, content in rows:
            if not isinstance(content, dict):
                continue
            categories = content.get("categories")
            if not isinstance(categories, list):
                continue
            for raw in categories:
                cleaned = clean_category(raw)
                if not cleaned:
                    continue
                variants_by_norm[normalize_key(cleaned)][cleaned] += 1

        canonical_by_norm = {
            norm_key: choose_canonical(variants)
            for norm_key, variants in variants_by_norm.items()
        }

        changed_rows = []
        for row_id, slug, content in rows:
            content = content if isinstance(content, dict) else {}
            categories = content.get("categories")

            normalized_categories = []
            seen = set()
            if isinstance(categories, list):
                for raw in categories:
                    cleaned = clean_category(raw)
                    if not cleaned:
                        continue
                    canonical = canonical_by_norm.get(normalize_key(cleaned), cleaned)
                    if canonical not in seen:
                        seen.add(canonical)
                        normalized_categories.append(canonical)

            if not normalized_categories:
                normalized_categories = ["Uncategorized"]

            previous_categories = categories if isinstance(categories, list) else []
            if previous_categories != normalized_categories:
                updated_content = dict(content)
                updated_content["categories"] = normalized_categories
                changed_rows.append((row_id, slug, previous_categories, normalized_categories, updated_content))

        dropdown_categories = sorted({value for value in canonical_by_norm.values() if value})
        if "Uncategorized" not in dropdown_categories:
            dropdown_categories.append("Uncategorized")
            dropdown_categories.sort()

        print(f"Total posts scanned: {len(rows)}")
        print(f"Posts needing category update: {len(changed_rows)}")
        print("\nUI dropdown categories after normalization:")
        for category in dropdown_categories:
            print(f"- {category}")

        if changed_rows:
            print("\nSample category updates:")
            for _, slug, before, after, _ in changed_rows[:15]:
                print(f"- {slug}: {before} -> {after}")

        if dry_run:
            print("\n[DRY RUN] No database changes applied.")
            return 0

        with conn, conn.cursor() as cur:
            for row_id, _, _, _, updated_content in changed_rows:
                cur.execute(
                    'UPDATE public."Blog Posts" SET content_json = %s, updated_at = NOW() WHERE id = %s',
                    (Json(updated_content), row_id),
                )

        print(f"\nApplied updates to {len(changed_rows)} posts.")
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
