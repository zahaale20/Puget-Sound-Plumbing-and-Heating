import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();
global.fetch = fetchMock;

async function importServiceFresh() {
	vi.resetModules();
	return import("./blogService");
}

describe("blogService", () => {
	beforeEach(() => {
		fetchMock.mockReset();
	});

	it("fetches blog posts from /api/blog", async () => {
		const mockPosts = [
			{
				id: 7,
				title: "Pipe Winterization",
				slug: "pipe-winterization",
				link: "/blog/pipe-winterization",
				date: "2026-01-15",
				author: "PSPAH",
				views: 12,
				description: "Tips",
				keywords: ["Plumbing"],
				sections: ["A"],
				featuredImageKey: "blog/1.jpg",
				contentImageKeys: ["blog/2.jpg"],
				sourceUrl: "https://example.com/post",
			},
		];

		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve(mockPosts),
		});

		const { fetchBlogPosts } = await importServiceFresh();
		const posts = await fetchBlogPosts();

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(fetchMock.mock.calls[0][0]).toContain("/api/blog");
		expect(posts).toHaveLength(1);
		expect(posts[0]).toMatchObject({
			title: "Pipe Winterization",
			slug: "pipe-winterization",
			description: "Tips",
			keywords: ["Plumbing"],
			sections: ["A"],
		});
	});

	it("returns empty when API returns empty array", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve([]),
		});

		const { fetchBlogPosts } = await importServiceFresh();
		const posts = await fetchBlogPosts();

		expect(posts).toEqual([]);
	});

	it("throws when API returns an error status", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 500,
		});

		const { fetchBlogPosts } = await importServiceFresh();

		await expect(fetchBlogPosts()).rejects.toThrow("Failed to fetch blog posts: 500");
	});

	it("increments views via POST to /api/blog/:slug/views", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ views: 42 }),
		});

		const { incrementBlogPostViews } = await importServiceFresh();
		const views = await incrementBlogPostViews("some-post");

		expect(views).toBe(42);
		expect(fetchMock.mock.calls[0][0]).toContain("/api/blog/some-post/views");
		expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "POST" });
	});

	it("returns null when view increment fails", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 429,
		});

		const { incrementBlogPostViews } = await importServiceFresh();
		const views = await incrementBlogPostViews("rate-limited-post");

		expect(views).toBeNull();
	});

	it("returns null for empty slug", async () => {
		const { incrementBlogPostViews } = await importServiceFresh();
		const views = await incrementBlogPostViews("");

		expect(views).toBeNull();
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
