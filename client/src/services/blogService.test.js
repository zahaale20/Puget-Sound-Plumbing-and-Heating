import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchBlogPosts, incrementBlogPostViews } from "./blogService";

describe("blogService", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	describe("fetchBlogPosts", () => {
		it("returns parsed JSON on a 2xx response", async () => {
			const posts = [{ slug: "a" }, { slug: "b" }];
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => posts,
			});

			await expect(fetchBlogPosts()).resolves.toEqual(posts);
			expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/blog$/));
		});

		it("throws with the status code on a non-2xx response", async () => {
			fetch.mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) });
			await expect(fetchBlogPosts()).rejects.toThrow(/503/);
		});
	});

	describe("incrementBlogPostViews", () => {
		it("returns null when given a falsy slug without calling fetch", async () => {
			await expect(incrementBlogPostViews("")).resolves.toBeNull();
			await expect(incrementBlogPostViews(undefined)).resolves.toBeNull();
			expect(fetch).not.toHaveBeenCalled();
		});

		it("returns the numeric view count on success", async () => {
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ views: 42 }),
			});
			await expect(incrementBlogPostViews("post-slug")).resolves.toBe(42);
		});

		it("returns null when the response is not ok", async () => {
			fetch.mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({}) });
			await expect(incrementBlogPostViews("post-slug")).resolves.toBeNull();
		});

		it("returns null when views is missing or non-numeric", async () => {
			fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
			await expect(incrementBlogPostViews("post-slug")).resolves.toBeNull();
		});

		it("swallows network errors and returns null", async () => {
			fetch.mockRejectedValueOnce(new Error("offline"));
			await expect(incrementBlogPostViews("post-slug")).resolves.toBeNull();
		});

		it("encodes the slug to prevent path injection", async () => {
			fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ views: 1 }) });
			await incrementBlogPostViews("a slug/with?weird&chars");
			expect(fetch).toHaveBeenCalledWith(
				expect.stringContaining(encodeURIComponent("a slug/with?weird&chars")),
				expect.objectContaining({ method: "POST" })
			);
		});
	});
});
