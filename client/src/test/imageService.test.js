import { describe, it, expect, vi } from "vitest";

// Mock import.meta.env before importing
vi.stubEnv("VITE_CLOUDFRONT_URL", "https://cdn.test.com");

const { getCloudFrontUrl, getResponsiveImageUrls, getOptimizedImageUrls, getSignedUrl } =
	await import("../services/imageService.js");

describe("imageService", () => {
	describe("getCloudFrontUrl", () => {
		it("returns full URL for image key", () => {
			expect(getCloudFrontUrl("hero.jpg")).toBe("https://cdn.test.com/hero.jpg");
		});

		it("strips leading slash from image key", () => {
			expect(getCloudFrontUrl("/hero.jpg")).toBe("https://cdn.test.com/hero.jpg");
		});

		it("returns empty string for falsy input", () => {
			expect(getCloudFrontUrl("")).toBe("");
			expect(getCloudFrontUrl(null)).toBe("");
			expect(getCloudFrontUrl(undefined)).toBe("");
		});

		it("handles nested paths", () => {
			expect(getCloudFrontUrl("public/team/photo.png")).toBe(
				"https://cdn.test.com/public/team/photo.png"
			);
		});
	});

	describe("getResponsiveImageUrls", () => {
		it("returns array of sized URLs", () => {
			const urls = getResponsiveImageUrls("hero.jpg");
			expect(urls).toHaveLength(3);
			expect(urls[0].width).toBe(400);
			expect(urls[1].width).toBe(800);
			expect(urls[2].width).toBe(1200);
			expect(urls[0].src).toContain("hero.jpg");
		});

		it("returns empty array for falsy input", () => {
			expect(getResponsiveImageUrls("")).toEqual([]);
			expect(getResponsiveImageUrls(null)).toEqual([]);
		});

		it("accepts custom sizes", () => {
			const urls = getResponsiveImageUrls("hero.jpg", [300, 600]);
			expect(urls).toHaveLength(2);
			expect(urls[0].width).toBe(300);
		});

		it("strips leading slash", () => {
			const urls = getResponsiveImageUrls("/hero.jpg");
			expect(urls[0].src).toBe("https://cdn.test.com/hero.jpg");
		});
	});

	describe("getOptimizedImageUrls", () => {
		it("returns webp and fallback URLs", () => {
			const result = getOptimizedImageUrls("hero.jpg");
			expect(result.webp).toBe("https://cdn.test.com/hero.jpg");
			expect(result.fallback).toBe("https://cdn.test.com/hero.jpg");
		});

		it("returns empty strings for falsy input", () => {
			const result = getOptimizedImageUrls("");
			expect(result.webp).toBe("");
			expect(result.fallback).toBe("");
		});
	});

	describe("getSignedUrl", () => {
		it("returns CloudFront URL (alias)", async () => {
			const url = await getSignedUrl("hero.jpg");
			expect(url).toBe("https://cdn.test.com/hero.jpg");
		});
	});
});
