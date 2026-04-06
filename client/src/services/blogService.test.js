import { beforeEach, describe, expect, it, vi } from "vitest";

const fromMock = vi.fn();
const rpcMock = vi.fn();

vi.mock("./supabaseClient", () => ({
	supabase: {
		from: fromMock,
		rpc: rpcMock,
	},
}));

function buildFetchBuilder(result) {
	return {
		select: vi.fn(() => ({
			order: vi.fn().mockResolvedValue(result),
		})),
	};
}

function buildReadBySlugBuilder(result) {
	return {
		select: vi.fn(() => ({
			eq: vi.fn(() => ({
				single: vi.fn().mockResolvedValue(result),
			})),
		})),
	};
}

function buildUpdateByIdBuilder(result) {
	return {
		update: vi.fn(() => ({
			eq: vi.fn().mockResolvedValue(result),
		})),
	};
}

async function importServiceFresh() {
	vi.resetModules();
	return import("./blogService");
}

describe("blogService", () => {
	beforeEach(() => {
		fromMock.mockReset();
		rpcMock.mockReset();
	});

	it("fetches blog posts from the canonical table when available", async () => {
		fromMock.mockReturnValueOnce(
			buildFetchBuilder({
				data: [
					{
						id: 7,
						title: "Pipe Winterization",
						slug: "pipe-winterization",
						source_url: "https://example.com/post",
						published_date: "2026-01-15",
						author: "PSPAH",
						views: 12,
						content_json: { description: "Tips", categories: ["Plumbing"], sections: ["A"] },
						featured_image_s3_key: "blog-posts-images/1.jpg",
						content_image_s3_keys: ["blog-posts-images/2.jpg"],
					},
				],
				error: null,
			})
		);

		const { fetchBlogPosts } = await importServiceFresh();
		const posts = await fetchBlogPosts();

		expect(fromMock).toHaveBeenCalledTimes(1);
		expect(fromMock).toHaveBeenCalledWith("Blog Posts");
		expect(posts).toHaveLength(1);
		expect(posts[0]).toMatchObject({
			title: "Pipe Winterization",
			slug: "pipe-winterization",
			description: "Tips",
			keywords: ["Plumbing"],
			sections: ["A"],
		});
	});

	it("falls back to legacy blog_posts table when Blog Posts is missing", async () => {
		fromMock
			.mockReturnValueOnce(
				buildFetchBuilder({
					data: null,
					error: { code: "42P01", message: "relation \"Blog Posts\" does not exist" },
				})
			)
			.mockReturnValueOnce(
				buildFetchBuilder({
					data: [{ id: 1, title: "Legacy", slug: "legacy", content_json: {} }],
					error: null,
				})
			);

		const { fetchBlogPosts } = await importServiceFresh();
		const posts = await fetchBlogPosts();

		expect(fromMock).toHaveBeenCalledTimes(2);
		expect(fromMock.mock.calls.map((call) => call[0])).toEqual(["Blog Posts", "blog_posts"]);
		expect(posts[0].slug).toBe("legacy");
	});

	it("falls back to legacy blog_posts table when Blog Posts exists but is empty", async () => {
		fromMock
			.mockReturnValueOnce(
				buildFetchBuilder({
					data: [],
					error: null,
				})
			)
			.mockReturnValueOnce(
				buildFetchBuilder({
					data: [{ id: 2, title: "Legacy Filled", slug: "legacy-filled", content_json: {} }],
					error: null,
				})
			);

		const { fetchBlogPosts } = await importServiceFresh();
		const posts = await fetchBlogPosts();

		expect(fromMock).toHaveBeenCalledTimes(2);
		expect(fromMock.mock.calls.map((call) => call[0])).toEqual(["Blog Posts", "blog_posts"]);
		expect(posts).toHaveLength(1);
		expect(posts[0].slug).toBe("legacy-filled");
	});

	it("returns empty when all candidate tables are empty", async () => {
		fromMock
			.mockReturnValueOnce(
				buildFetchBuilder({
					data: [],
					error: null,
				})
			)
			.mockReturnValueOnce(
				buildFetchBuilder({
					data: [],
					error: null,
				})
			);

		const { fetchBlogPosts } = await importServiceFresh();
		const posts = await fetchBlogPosts();

		expect(fromMock).toHaveBeenCalledTimes(2);
		expect(posts).toEqual([]);
	});

	it("throws immediately for non-relation Supabase errors", async () => {
		fromMock.mockReturnValueOnce(
			buildFetchBuilder({
				data: null,
				error: { code: "42501", message: "permission denied for table Blog Posts" },
			})
		);

		const { fetchBlogPosts } = await importServiceFresh();

		await expect(fetchBlogPosts()).rejects.toMatchObject({ code: "42501" });
		expect(fromMock).toHaveBeenCalledTimes(1);
	});

	it("increments views via RPC when available", async () => {
		rpcMock.mockResolvedValueOnce({ data: 42, error: null });

		const { incrementBlogPostViews } = await importServiceFresh();
		const views = await incrementBlogPostViews("some-post");

		expect(views).toBe(42);
		expect(fromMock).not.toHaveBeenCalled();
	});

	it("falls back to table update when RPC fails and primary table is missing", async () => {
		rpcMock.mockResolvedValueOnce({ data: null, error: { code: "PGRST301" } });

		fromMock
			.mockReturnValueOnce(
				buildReadBySlugBuilder({
					data: null,
					error: { code: "42P01", message: "relation \"Blog Posts\" does not exist" },
				})
			)
			.mockReturnValueOnce(buildReadBySlugBuilder({ data: { id: 9, views: 3 }, error: null }))
			.mockReturnValueOnce(buildUpdateByIdBuilder({ error: null }));

		const { incrementBlogPostViews } = await importServiceFresh();
		const views = await incrementBlogPostViews("legacy-post");

		expect(views).toBe(4);
		expect(fromMock.mock.calls.map((call) => call[0])).toEqual(["Blog Posts", "blog_posts", "blog_posts"]);
	});
});
