import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getImageUrl } from "./imageService";

const ORIGINAL_STORAGE_URL = import.meta.env.VITE_SUPABASE_STORAGE_URL;

describe("getImageUrl", () => {
	beforeEach(() => {
		import.meta.env.VITE_SUPABASE_STORAGE_URL = "https://example.supabase.co";
	});

	afterEach(() => {
		import.meta.env.VITE_SUPABASE_STORAGE_URL = ORIGINAL_STORAGE_URL;
		vi.restoreAllMocks();
	});

	it("returns an empty string when no key is provided", () => {
		expect(getImageUrl("")).toBe("");
		expect(getImageUrl(undefined)).toBe("");
		expect(getImageUrl(null)).toBe("");
	});

	it("builds a URL against the configured storage base", () => {
		expect(getImageUrl("blog/post.webp")).toBe(
			"https://example.supabase.co/storage/v1/object/public/assets/blog/post.webp"
		);
	});

	it("strips a single leading slash from the key without losing path segments", () => {
		expect(getImageUrl("/blog/post.webp")).toBe(
			"https://example.supabase.co/storage/v1/object/public/assets/blog/post.webp"
		);
	});

	it("preserves nested path segments inside the key", () => {
		expect(getImageUrl("site/hero/large.webp")).toBe(
			"https://example.supabase.co/storage/v1/object/public/assets/site/hero/large.webp"
		);
	});

	it("throws when the storage URL env var is missing", () => {
		delete import.meta.env.VITE_SUPABASE_STORAGE_URL;
		expect(() => getImageUrl("blog/post.webp")).toThrow(
			/VITE_SUPABASE_STORAGE_URL/
		);
	});
});
