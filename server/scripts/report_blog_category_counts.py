#!/usr/bin/env python3
"""Report blog category counts and consistency vs normalized category set."""

import os
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

import psycopg2
from dotenv import load_dotenv


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


def clean_category(value: Any) -> str:
    if not isinstance(value, str):
        return ""
    return " ".join(value.split()).strip()


def normalize_key(value: str) -> str:
    return value.casefold()


def pick_canonical(variants: Counter) -> str:
    return sorted(variants.items(), key=lambda item: (-item[1], len(item[0]), item[0]))[0][0]


def main() -> int:
    load_environment()
    conn = get_connection()

    try:
        with conn, conn.cursor() as cur:
            cur.execute('SELECT id, slug, content_json FROM public."Blog Posts" ORDER BY id')
            rows = cur.fetchall()

        variant_groups: dict[str, Counter] = defaultdict(Counter)
        per_post_cleaned: list[tuple[int, str, list[str]]] = []

        for row_id, slug, content in rows:
            content = content if isinstance(content, dict) else {}
            raw_categories = content.get("categories")
            cleaned = []
            if isinstance(raw_categories, list):
                for raw in raw_categories:
                    category = clean_category(raw)
                    if category:
                        cleaned.append(category)
                        variant_groups[normalize_key(category)][category] += 1
            per_post_cleaned.append((row_id, slug, cleaned))

        canonical_map = {
            norm_key: pick_canonical(variants)
            for norm_key, variants in variant_groups.items()
        }

        category_occurrences = Counter()
        posts_per_category = Counter()
        simulated_changes = 0
        invalid_after_normalization = 0

        canonical_set = set(canonical_map.values())
        canonical_set.add("Uncategorized")

        for _, _, cleaned in per_post_cleaned:
            normalized = []
            seen = set()
            for category in cleaned:
                canonical = canonical_map.get(normalize_key(category), category)
                if canonical not in seen:
                    seen.add(canonical)
                    normalized.append(canonical)

            if not normalized:
                normalized = ["Uncategorized"]

            for category in normalized:
                category_occurrences[category] += 1
            for category in set(normalized):
                posts_per_category[category] += 1

            if cleaned != normalized:
                simulated_changes += 1

            for category in normalized:
                if category not in canonical_set:
                    invalid_after_normalization += 1

        print(f"total_posts={len(rows)}")
        print(f"categories_in_canonical_set={len(canonical_set)}")
        print(f"posts_that_would_change_if_rewritten_now={simulated_changes}")
        print(f"invalid_categories_after_normalization={invalid_after_normalization}")

        multi_variant_groups = {
            norm_key: dict(variants)
            for norm_key, variants in variant_groups.items()
            if len(variants) > 1
        }
        print(f"variant_groups_detected={len(multi_variant_groups)}")
        if multi_variant_groups:
            print("variant_group_details_start")
            for norm_key in sorted(multi_variant_groups):
                print(f"{norm_key}: {multi_variant_groups[norm_key]}")
            print("variant_group_details_end")

        print("category_counts_start")
        for category in sorted(category_occurrences):
            print(
                f"{category}\tpost_occurrences={category_occurrences[category]}\tposts_with_category={posts_per_category[category]}"
            )
        print("category_counts_end")

        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
