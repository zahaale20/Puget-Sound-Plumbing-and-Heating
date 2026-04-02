#!/usr/bin/env python3
"""Auto-reclassify blog post categories from title/description/content and sync to Supabase."""

import argparse
import json
import os
import re
from collections import Counter
from pathlib import Path
from typing import Any

import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import Json

CATEGORY_SET = [
    "Bathroom Plumbing",
    "Drain Service",
    "Emergency Plumbing",
    "Heating Service",
    "Kitchen Plumbing",
    "Leak Detection",
    "Pipe Repair",
    "Plumbing Basics",
    "Plumbing System",
    "Save Money",
    "Seasonal Plumbing",
    "Sewer Service",
    "Toilet",
    "Uncategorized",
    "Water Heater",
    "Water Quality",
]

CATEGORY_RULES = {
    "Bathroom Plumbing": [
        "bathroom", "bathtub", "shower", "faucet", "vanity", "bath", "bath remodel",
    ],
    "Drain Service": [
        "drain", "clog", "clogged", "drain cleaning", "snaking", "slow drain", "unclog",
    ],
    "Emergency Plumbing": [
        "emergency", "urgent", "burst pipe", "overflow", "flood", "immediate", "24/7",
    ],
    "Heating Service": [
        "furnace", "boiler", "heating", "heater repair", "heat pump", "thermostat", "radiator",
    ],
    "Kitchen Plumbing": [
        "kitchen", "garbage disposal", "dishwasher", "kitchen sink", "food waste", "disposal",
    ],
    "Leak Detection": [
        "leak", "leaking", "water damage", "slab leak", "hidden leak", "detect leak",
    ],
    "Pipe Repair": [
        "pipe", "piping", "repipe", "corroded", "rusted", "pipe repair", "frozen pipe",
    ],
    "Plumbing Basics": [
        "plumbing tips", "homeowner", "diy", "how to", "common plumbing", "quick fix", "basics",
    ],
    "Plumbing System": [
        "plumbing system", "water pressure", "supply line", "drainage system", "main line", "components",
    ],
    "Save Money": [
        "water bill", "save money", "reduce", "lower bill", "efficiency", "conserve", "cost",
    ],
    "Seasonal Plumbing": [
        "winter", "summer", "spring", "fall", "seasonal", "cold weather", "freeze", "holiday",
    ],
    "Sewer Service": [
        "sewer", "sewage", "septic", "backflow", "main sewer", "sewer line",
    ],
    "Toilet": [
        "toilet", "flush", "flushing", "commode", "toilet tank", "toilet paper",
    ],
    "Water Heater": [
        "water heater", "tankless", "hot water", "anode", "pilot light", "heater tank",
    ],
    "Water Quality": [
        "water quality", "water softener", "filtration", "drinking water", "hard water", "contaminant",
    ],
}

TITLE_MULTIPLIER = 3
DESCRIPTION_MULTIPLIER = 2
CONTENT_MULTIPLIER = 1
MIN_PRIMARY_SCORE = 2
SECONDARY_RATIO = 0.65
SECONDARY_MIN_SCORE = 2
MAX_CATEGORIES_PER_POST = 3


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


def normalize(text: str) -> str:
    lowered = text.lower()
    lowered = re.sub(r"[^a-z0-9\s]", " ", lowered)
    return re.sub(r"\s+", " ", lowered).strip()


def build_content_text(content_json: dict[str, Any]) -> str:
    parts: list[str] = []

    description = content_json.get("description")
    if isinstance(description, str):
        parts.append(description)

    sections = content_json.get("sections")
    if isinstance(sections, list):
        for section in sections:
            if isinstance(section, dict):
                heading = section.get("heading")
                if isinstance(heading, str):
                    parts.append(heading)
                section_content = section.get("content")
                if isinstance(section_content, list):
                    for block in section_content:
                        if isinstance(block, str):
                            parts.append(block)
                        elif isinstance(block, list):
                            parts.extend(item for item in block if isinstance(item, str))
                        elif isinstance(block, dict):
                            parts.append(json.dumps(block))
                elif isinstance(section_content, str):
                    parts.append(section_content)

    return "\n".join(parts)


def score_matches(text: str, keyword: str) -> int:
    if not text or not keyword:
        return 0
    if " " in keyword:
        return text.count(keyword)
    return len(re.findall(rf"\b{re.escape(keyword)}\b", text))


def classify_post(title: str, description: str, content_text: str) -> tuple[list[str], dict[str, int]]:
    title_text = normalize(title)
    description_text = normalize(description)
    body_text = normalize(content_text)

    scores: dict[str, int] = {}
    for category, keywords in CATEGORY_RULES.items():
        score = 0
        for keyword in keywords:
            key = normalize(keyword)
            score += score_matches(title_text, key) * TITLE_MULTIPLIER
            score += score_matches(description_text, key) * DESCRIPTION_MULTIPLIER
            score += score_matches(body_text, key) * CONTENT_MULTIPLIER

        # Intentional tie-breaker boosts for strongly themed categories.
        if category == "Toilet" and "toilet" in title_text:
            score += 2
        if category == "Water Heater" and "water heater" in title_text:
            score += 2
        if category == "Sewer Service" and "sewer" in title_text:
            score += 2
        scores[category] = score

    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    top_category, top_score = ranked[0]

    if top_score < MIN_PRIMARY_SCORE:
        return ["Uncategorized"], scores

    selected = [top_category]
    for category, score in ranked[1:]:
        if len(selected) >= MAX_CATEGORIES_PER_POST:
            break
        if score >= SECONDARY_MIN_SCORE and score >= int(top_score * SECONDARY_RATIO):
            selected.append(category)

    # Ensure no accidental Uncategorized alongside specific labels.
    selected = [cat for cat in selected if cat != "Uncategorized"] or ["Uncategorized"]
    return selected, scores


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Write reclassified categories back to Supabase.")
    args = parser.parse_args()
    dry_run = not args.apply

    load_environment()
    conn = get_connection()

    try:
        with conn, conn.cursor() as cur:
            cur.execute('SELECT id, slug, title, content_json FROM public."Blog Posts" ORDER BY id')
            rows = cur.fetchall()

        updates = []
        label_counts = Counter()
        preview = []

        for row_id, slug, title, content_json in rows:
            content_json = content_json if isinstance(content_json, dict) else {}
            old_categories = content_json.get("categories") if isinstance(content_json.get("categories"), list) else []

            description = content_json.get("description") if isinstance(content_json.get("description"), str) else ""
            content_text = build_content_text(content_json)
            new_categories, scores = classify_post(title or "", description, content_text)

            for label in new_categories:
                label_counts[label] += 1

            if old_categories != new_categories:
                updated_content = dict(content_json)
                updated_content["categories"] = new_categories
                updates.append((row_id, slug, old_categories, new_categories, updated_content))
                if len(preview) < 20:
                    preview.append((slug, old_categories, new_categories, scores))

        print(f"Total posts scanned: {len(rows)}")
        print(f"Posts to update: {len(updates)}")

        print("\nProjected category distribution:")
        for label in CATEGORY_SET:
            print(f"- {label}: {label_counts.get(label, 0)}")

        if preview:
            print("\nSample updates:")
            for slug, old_categories, new_categories, scores in preview:
                top_debug = sorted(scores.items(), key=lambda item: item[1], reverse=True)[:3]
                print(f"- {slug}: {old_categories} -> {new_categories} | top_scores={top_debug}")

        if dry_run:
            print("\n[DRY RUN] No database changes applied.")
            return 0

        with conn, conn.cursor() as cur:
            for row_id, _, _, _, updated_content in updates:
                cur.execute(
                    'UPDATE public."Blog Posts" SET content_json = %s, updated_at = NOW() WHERE id = %s',
                    (Json(updated_content), row_id),
                )

        print(f"\nApplied updates: {len(updates)}")
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
