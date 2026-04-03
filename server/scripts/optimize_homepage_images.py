from pathlib import Path
import os
import subprocess
from typing import NamedTuple
from PIL import Image

BUCKET = os.environ["S3_MEDIA_BUCKET_NAME"]
WORK = Path("/tmp/pspah_img_opt")
ORIG = WORK / "orig"
OUT = WORK / "out"
ORIG.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)

DEFAULT_WEBP_QUALITY = 76


class Variant(NamedTuple):
    dst_key: str
    target_w: int
    target_h: int | None
    quality: int = DEFAULT_WEBP_QUALITY


JOBS = {
    "private/home-page-hero2.png": [
        Variant("private/home-page-hero2-1280.webp", 1280, None),
        Variant("private/home-page-hero2-1920.webp", 1920, None),
    ],
    "private/pattern1.png": [
        Variant("private/pattern1-1920.webp", 1920, None),
    ],
    "public/pspah-logo.png": [
        # Lower quality for tiny logo assets to improve transfer size without visible impact.
        Variant("public/pspah-logo-340.webp", 340, None, 58),
        Variant("public/pspah-logo-680.webp", 680, None, 62),
    ],
    "private/water-heaters-color.png": [Variant("private/water-heaters-color-96.webp", 96, 96)],
    "private/faucet-repair-color.png": [Variant("private/faucet-repair-color-96.webp", 96, 96)],
    "private/toilet-repair-color.png": [Variant("private/toilet-repair-color-96.webp", 96, 96)],
    "private/garbage-disposal-color.png": [Variant("private/garbage-disposal-color-96.webp", 96, 96)],
    "private/water-filtration-color.png": [Variant("private/water-filtration-color-96.webp", 96, 96)],
    "private/plumbing-repair-color.png": [Variant("private/plumbing-repair-color-96.webp", 96, 96)],
    # Stronger compression for footer trust badges (small rendered size).
    "private/google-reviews.png": [Variant("private/google-reviews-190.webp", 190, 110, 52)],
    "private/bbb-accredited-business.png": [Variant("private/bbb-accredited-business-295.webp", 295, 110, 58)],
}


def aws_cp(src: str, dst: str, extra: list[str] | None = None) -> None:
    cmd = ["aws", "s3", "cp", src, dst]
    if extra:
        cmd.extend(extra)
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL)


def optimize_to_webp(
    src_path: Path,
    dst_path: Path,
    target_w: int,
    target_h: int | None,
    quality: int = DEFAULT_WEBP_QUALITY,
) -> None:
    dst_path.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(src_path) as image:
        has_alpha = "A" in image.getbands()
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA" if has_alpha else "RGB")

        if target_h is None:
            width, height = image.size
            if width > target_w:
                new_height = int(height * (target_w / width))
                image = image.resize((target_w, new_height), Image.Resampling.LANCZOS)
        else:
            image.thumbnail((target_w, target_h), Image.Resampling.LANCZOS)

        image.save(dst_path, format="WEBP", quality=quality, method=6)


for src_key, variants in JOBS.items():
    src_local = ORIG / src_key.replace("/", "__")
    aws_cp(f"s3://{BUCKET}/{src_key}", str(src_local))

    for variant in variants:
        dst_local = OUT / variant.dst_key.replace("/", "__")
        optimize_to_webp(src_local, dst_local, variant.target_w, variant.target_h, quality=variant.quality)
        aws_cp(
            str(dst_local),
            f"s3://{BUCKET}/{variant.dst_key}",
            [
                "--content-type",
                "image/webp",
                "--cache-control",
                "public,max-age=31536000,immutable",
            ],
        )
        print(f"uploaded {variant.dst_key} ({dst_local.stat().st_size / 1024:.1f} KiB)")
