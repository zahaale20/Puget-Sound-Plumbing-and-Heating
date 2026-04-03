from pathlib import Path
import os
import subprocess
from PIL import Image

BUCKET = os.environ["S3_MEDIA_BUCKET_NAME"]
WORK = Path("/tmp/pspah_img_opt")
ORIG = WORK / "orig"
OUT = WORK / "out"
ORIG.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)

JOBS = {
    "private/home-page-hero2.png": [
        ("private/home-page-hero2-1280.webp", 1280, None),
        ("private/home-page-hero2-1920.webp", 1920, None),
    ],
    "private/pattern1.png": [
        ("private/pattern1-1920.webp", 1920, None),
    ],
    "public/pspah-logo.png": [
        ("public/pspah-logo-340.webp", 340, None),
        ("public/pspah-logo-680.webp", 680, None),
    ],
    "private/water-heaters-color.png": [("private/water-heaters-color-96.webp", 96, 96)],
    "private/faucet-repair-color.png": [("private/faucet-repair-color-96.webp", 96, 96)],
    "private/toilet-repair-color.png": [("private/toilet-repair-color-96.webp", 96, 96)],
    "private/garbage-disposal-color.png": [("private/garbage-disposal-color-96.webp", 96, 96)],
    "private/water-filtration-color.png": [("private/water-filtration-color-96.webp", 96, 96)],
    "private/plumbing-repair-color.png": [("private/plumbing-repair-color-96.webp", 96, 96)],
    "private/google-reviews.png": [("private/google-reviews-190.webp", 190, 110)],
    "private/bbb-accredited-business.png": [("private/bbb-accredited-business-295.webp", 295, 110)],
}


def aws_cp(src: str, dst: str, extra: list[str] | None = None) -> None:
    cmd = ["aws", "s3", "cp", src, dst]
    if extra:
        cmd.extend(extra)
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL)


def optimize_to_webp(src_path: Path, dst_path: Path, target_w: int, target_h: int | None) -> None:
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

        image.save(dst_path, format="WEBP", quality=76, method=6)


for src_key, variants in JOBS.items():
    src_local = ORIG / src_key.replace("/", "__")
    aws_cp(f"s3://{BUCKET}/{src_key}", str(src_local))

    for dst_key, target_w, target_h in variants:
        dst_local = OUT / dst_key.replace("/", "__")
        optimize_to_webp(src_local, dst_local, target_w, target_h)
        aws_cp(
            str(dst_local),
            f"s3://{BUCKET}/{dst_key}",
            [
                "--content-type",
                "image/webp",
                "--cache-control",
                "public,max-age=31536000,immutable",
            ],
        )
        print(f"uploaded {dst_key} ({dst_local.stat().st_size / 1024:.1f} KiB)")
