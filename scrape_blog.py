#!/usr/bin/env python3
"""
Blog scraper for pugetsoundplumbing.com
1. Scrapes all 36 pages of blog listings to collect post URLs
2. Scrapes each individual blog post for content + images
3. Downloads images locally
4. Uploads images to S3 bucket
5. Generates blog_posts.json with all post data
"""

import os
import re
import json
import time
import hashlib
import requests
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import boto3
from pathlib import Path

BASE_URL = "https://pugetsoundplumbing.com"
BLOG_URL = f"{BASE_URL}/blog/"
TOTAL_PAGES = 36
IMAGES_DIR = Path("scraped_images")
OUTPUT_FILE = "blog_posts.json"
S3_BUCKET = os.getenv("S3_BUCKET_NAME", "pspah-bucket")
S3_PREFIX = "blog-posts/"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

session = requests.Session()
session.headers.update(HEADERS)


def get_page_url(page_num):
    if page_num == 1:
        return BLOG_URL
    return f"{BLOG_URL}page/{page_num}/"


def scrape_listing_page(page_num):
    """Scrape a blog listing page and return post URLs."""
    url = get_page_url(page_num)
    print(f"  Scraping listing page {page_num}: {url}")

    resp = session.get(url, timeout=30)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    post_urls = []
    # Find all blog post links in the main content area
    # The blog uses h3 > a tags for post titles typically, or article links
    for link in soup.select("article a, .entry-title a, h2 a, h3 a"):
        href = link.get("href", "")
        if href and "/blog/" in href and href != BLOG_URL and "/category/" not in href and "/page/" not in href:
            full_url = urljoin(BASE_URL, href)
            if full_url not in post_urls:
                post_urls.append(full_url)

    # Also look for "Continue Reading" links
    for link in soup.find_all("a"):
        text = link.get_text(strip=True).lower()
        href = link.get("href", "")
        if "continue reading" in text and href and "/blog/" in href:
            full_url = urljoin(BASE_URL, href)
            if full_url not in post_urls:
                post_urls.append(full_url)

    print(f"    Found {len(post_urls)} post URLs")
    return post_urls


def collect_all_post_urls():
    """Scrape all 36 listing pages to get all unique post URLs."""
    all_urls = []
    seen = set()

    for page in range(1, TOTAL_PAGES + 1):
        try:
            urls = scrape_listing_page(page)
            for url in urls:
                if url not in seen:
                    seen.add(url)
                    all_urls.append(url)
            time.sleep(0.5)  # Be respectful
        except Exception as e:
            print(f"    ERROR on page {page}: {e}")

    print(f"\nTotal unique post URLs collected: {len(all_urls)}")
    return all_urls


def extract_date_from_post(soup):
    """Extract publish date from a blog post page."""
    # Try meta tags first
    for meta in soup.find_all("meta"):
        prop = meta.get("property", "") or meta.get("name", "")
        if "published_time" in prop or "date" in prop.lower():
            content = meta.get("content", "")
            if content:
                return content

    # Try time tags
    time_tag = soup.find("time")
    if time_tag:
        return time_tag.get("datetime", "") or time_tag.get_text(strip=True)

    # Try .entry-date or date-related classes
    for cls in ["entry-date", "post-date", "published", "date"]:
        el = soup.find(class_=re.compile(cls, re.I))
        if el:
            return el.get_text(strip=True)

    # Try to find date patterns in text near the title
    header = soup.find(["h1", "h2"])
    if header:
        parent = header.parent
        if parent:
            text = parent.get_text()
            # Look for date patterns like "DEC 09", "January 22, 2024", etc.
            match = re.search(
                r'((?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\w*\s+\d{1,2}(?:\s*,?\s*\d{4})?)',
                text, re.I
            )
            if match:
                return match.group(1)

    return ""


def extract_author_from_post(soup):
    """Extract author name from a blog post page."""
    # Try meta tags
    for meta in soup.find_all("meta"):
        prop = meta.get("property", "") or meta.get("name", "")
        if "author" in prop.lower():
            content = meta.get("content", "")
            if content:
                return content

    # Try author-related classes
    for cls in ["author", "byline", "writer", "entry-author"]:
        el = soup.find(class_=re.compile(cls, re.I))
        if el:
            text = el.get_text(strip=True)
            if text and text.lower() not in ["by", "by|", "|"]:
                return text

    # Try rel="author"
    author_link = soup.find("a", rel="author")
    if author_link:
        return author_link.get_text(strip=True)

    return "Puget Sound Plumbing"


def extract_categories_from_post(soup):
    """Extract categories/tags from a blog post page."""
    categories = []

    # Look for category links in the post metadata
    for link in soup.find_all("a", href=re.compile(r"/blog/category/")):
        cat = link.get_text(strip=True)
        if cat and cat not in categories:
            categories.append(cat)

    # Also check rel="tag" links
    for link in soup.find_all("a", rel="tag"):
        cat = link.get_text(strip=True)
        if cat and cat not in categories:
            categories.append(cat)

    return categories if categories else ["Uncategorized"]


def extract_featured_image(soup, post_url):
    """Extract the featured/hero image URL from a blog post."""
    # Try og:image meta tag first - usually the featured image
    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):
        return og_image["content"]

    # Try the first large image in the post content
    content_area = soup.find("article") or soup.find(class_=re.compile("entry-content|post-content|blog-content", re.I))
    if content_area:
        img = content_area.find("img")
        if img:
            src = img.get("src") or img.get("data-src") or img.get("data-lazy-src")
            if src:
                return urljoin(post_url, src)

    return ""


def extract_content_images(soup, post_url):
    """Extract all images from the blog post content area."""
    images = []
    content_area = soup.find("article") or soup.find(class_=re.compile("entry-content|post-content|blog-content", re.I))

    if not content_area:
        content_area = soup

    for img in content_area.find_all("img"):
        src = img.get("src") or img.get("data-src") or img.get("data-lazy-src")
        if not src:
            continue

        full_url = urljoin(post_url, src)

        # Skip small icons, logos, social buttons, etc.
        skip_patterns = [
            "sharethis", "facebook", "twitter", "linkedin", "pinterest",
            "gravatar", "avatar", "logo", "icon", "badge", "seal",
            "widget", "banner-ad", "advertisement", "pixel", "tracking",
            "1x1", "spacer"
        ]
        if any(pat in full_url.lower() for pat in skip_patterns):
            continue

        alt = img.get("alt", "")
        images.append({"url": full_url, "alt": alt})

    return images


def extract_post_content(soup):
    """Extract the main blog post content as structured sections."""
    content_area = soup.find(class_=re.compile("entry-content|post-content|blog-content", re.I))
    if not content_area:
        content_area = soup.find("article")

    if not content_area:
        return [], ""

    sections = []
    current_section = {"heading": "", "content": []}
    description = ""

    for element in content_area.children:
        if not hasattr(element, 'name') or element.name is None:
            text = str(element).strip()
            if text:
                current_section["content"].append(text)
            continue

        if element.name in ["h1", "h2", "h3", "h4", "h5", "h6"]:
            # Save previous section
            if current_section["content"] or current_section["heading"]:
                sections.append(current_section)
            current_section = {
                "heading": element.get_text(strip=True),
                "content": []
            }
        elif element.name == "p":
            text = element.get_text(strip=True)
            if text:
                current_section["content"].append(text)
                if not description:
                    description = text
        elif element.name in ["ul", "ol"]:
            items = [li.get_text(strip=True) for li in element.find_all("li")]
            if items:
                current_section["content"].append(items)
        elif element.name == "blockquote":
            text = element.get_text(strip=True)
            if text:
                current_section["content"].append(f"> {text}")
        elif element.name == "table":
            rows = []
            for tr in element.find_all("tr"):
                cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
                if any(cells):
                    rows.append(cells)
            if rows:
                current_section["content"].append({"table": rows})

    # Save last section
    if current_section["content"] or current_section["heading"]:
        sections.append(current_section)

    return sections, description


def scrape_blog_post(post_url, post_id):
    """Scrape a single blog post and return structured data."""
    print(f"  [{post_id}] Scraping: {post_url}")

    resp = session.get(post_url, timeout=30)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    # Extract title
    title = ""
    h1 = soup.find("h1")
    if h1:
        title = h1.get_text(strip=True)
    else:
        og_title = soup.find("meta", property="og:title")
        if og_title:
            title = og_title.get("content", "")

    # Extract slug from URL
    parsed = urlparse(post_url)
    slug = parsed.path.rstrip("/").split("/")[-1]

    # Extract metadata
    date = extract_date_from_post(soup)
    author = extract_author_from_post(soup)
    categories = extract_categories_from_post(soup)
    featured_image = extract_featured_image(soup, post_url)
    content_images = extract_content_images(soup, post_url)
    sections, description = extract_post_content(soup)

    # Extract meta description as fallback
    if not description:
        meta_desc = soup.find("meta", attrs={"name": "description"})
        if meta_desc:
            description = meta_desc.get("content", "")

    post_data = {
        "id": post_id,
        "title": title,
        "slug": slug,
        "url": post_url,
        "link": f"/blog/{slug}",
        "date": date,
        "author": author,
        "categories": categories,
        "description": description,
        "featured_image_url": featured_image,
        "content_images": content_images,
        "sections": sections,
        "featured_image_s3_key": "",
        "content_image_s3_keys": [],
    }

    return post_data


def download_image(url, save_dir):
    """Download an image and return the local path."""
    try:
        resp = session.get(url, timeout=30, stream=True)
        resp.raise_for_status()

        # Determine filename from URL
        parsed = urlparse(url)
        filename = os.path.basename(parsed.path)
        if not filename or "." not in filename:
            # Generate filename from URL hash
            ext = ".jpg"
            content_type = resp.headers.get("content-type", "")
            if "png" in content_type:
                ext = ".png"
            elif "webp" in content_type:
                ext = ".webp"
            elif "gif" in content_type:
                ext = ".gif"
            filename = hashlib.md5(url.encode()).hexdigest() + ext

        filepath = save_dir / filename
        # Handle duplicates
        counter = 1
        original_stem = filepath.stem
        while filepath.exists():
            filepath = save_dir / f"{original_stem}_{counter}{filepath.suffix}"
            counter += 1

        with open(filepath, "wb") as f:
            for chunk in resp.iter_content(8192):
                f.write(chunk)

        return filepath
    except Exception as e:
        print(f"    Failed to download {url}: {e}")
        return None


def upload_to_s3(filepath, s3_key, s3_client):
    """Upload a file to S3 and return the key."""
    content_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
    }
    ext = filepath.suffix.lower()
    content_type = content_types.get(ext, "application/octet-stream")

    try:
        s3_client.upload_file(
            str(filepath),
            S3_BUCKET,
            s3_key,
            ExtraArgs={"ContentType": content_type}
        )
        print(f"    Uploaded to s3://{S3_BUCKET}/{s3_key}")
        return s3_key
    except Exception as e:
        print(f"    S3 upload failed for {filepath}: {e}")
        return None


def process_images(post_data, s3_client):
    """Download and upload images for a single post."""
    slug = post_data["slug"]
    post_images_dir = IMAGES_DIR / slug
    post_images_dir.mkdir(parents=True, exist_ok=True)

    # Process featured image
    if post_data["featured_image_url"]:
        print(f"    Downloading featured image...")
        local_path = download_image(post_data["featured_image_url"], post_images_dir)
        if local_path and s3_client:
            s3_key = f"{S3_PREFIX}{slug}/featured{local_path.suffix}"
            uploaded_key = upload_to_s3(local_path, s3_key, s3_client)
            if uploaded_key:
                post_data["featured_image_s3_key"] = uploaded_key

    # Process content images
    for i, img_info in enumerate(post_data["content_images"]):
        img_url = img_info["url"]
        # Skip if it's the same as featured image
        if img_url == post_data["featured_image_url"]:
            continue

        print(f"    Downloading content image {i+1}...")
        local_path = download_image(img_url, post_images_dir)
        if local_path and s3_client:
            s3_key = f"{S3_PREFIX}{slug}/img_{i+1}{local_path.suffix}"
            uploaded_key = upload_to_s3(local_path, s3_key, s3_client)
            if uploaded_key:
                post_data["content_image_s3_keys"].append({
                    "key": uploaded_key,
                    "alt": img_info["alt"]
                })

    return post_data


def init_s3_client():
    """Initialize S3 client from environment variables."""
    aws_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
    aws_region = os.getenv("AWS_REGION", "us-west-2")

    if not aws_key or not aws_secret:
        print("WARNING: AWS credentials not found. Images will be downloaded but NOT uploaded to S3.")
        print("Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.")
        return None

    return boto3.client(
        "s3",
        aws_access_key_id=aws_key,
        aws_secret_access_key=aws_secret,
        region_name=aws_region,
    )


def main():
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    # Initialize S3 client
    s3_client = init_s3_client()

    # Step 1: Collect all blog post URLs
    print("=" * 60)
    print("STEP 1: Collecting blog post URLs from all 36 pages")
    print("=" * 60)
    all_urls = collect_all_post_urls()

    # Save URLs for reference
    with open("blog_post_urls.json", "w") as f:
        json.dump(all_urls, f, indent=2)
    print(f"Saved {len(all_urls)} URLs to blog_post_urls.json\n")

    # Step 2: Scrape each blog post
    print("=" * 60)
    print("STEP 2: Scraping individual blog posts")
    print("=" * 60)
    all_posts = []

    for i, url in enumerate(all_urls, 1):
        try:
            post_data = scrape_blog_post(url, i)
            all_posts.append(post_data)
            time.sleep(0.5)  # Be respectful
        except Exception as e:
            print(f"  ERROR scraping {url}: {e}")

    # Save intermediate results
    with open(OUTPUT_FILE, "w") as f:
        json.dump(all_posts, f, indent=2)
    print(f"\nScraped {len(all_posts)} blog posts. Saved to {OUTPUT_FILE}\n")

    # Step 3: Download and upload images
    print("=" * 60)
    print("STEP 3: Downloading and uploading images")
    print("=" * 60)

    for i, post in enumerate(all_posts):
        print(f"\n[{i+1}/{len(all_posts)}] Processing images for: {post['title']}")
        all_posts[i] = process_images(post, s3_client)
        time.sleep(0.3)

    # Save final results
    with open(OUTPUT_FILE, "w") as f:
        json.dump(all_posts, f, indent=2)
    print(f"\nFinal data saved to {OUTPUT_FILE}")
    print(f"Images saved to {IMAGES_DIR}/")
    print(f"\nTotal posts: {len(all_posts)}")
    total_images = sum(1 for p in all_posts if p["featured_image_s3_key"]) + \
                   sum(len(p["content_image_s3_keys"]) for p in all_posts)
    print(f"Total images uploaded: {total_images}")


if __name__ == "__main__":
    main()
