import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import BlogPage from "./BlogPage";

vi.mock("../services/blogService", () => ({
	fetchBlogPosts: vi.fn(),
}));

vi.mock("../services/imageService", () => ({
	getCloudFrontUrl: (key) => `/images/${key || ""}`,
}));

vi.mock("../components/ui/LoadingComponents", () => ({
	ImageWithLoader: ({ src, alt, className = "", ...props }) => (
		<img src={src} alt={alt} className={className} {...props} />
	),
	LazyBackgroundImage: ({ children, className = "", ...props }) => (
		<div className={className} {...props}>
			{children}
		</div>
	),
}));

const { fetchBlogPosts } = await import("../services/blogService");

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

describe("BlogPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
	});

	afterEach(() => {
		act(() => {
			root.unmount();
		});
		container.remove();
	});

	it("renders fetched blog posts instead of the empty-state filter message", async () => {
		fetchBlogPosts.mockResolvedValue([
			{
				id: "1",
				title: "Water Heater Basics",
				slug: "water-heater-basics",
				date: "2026-04-01",
				author: "Puget Sound Plumbing",
				views: 10,
				description: "A practical guide to common water heater maintenance.",
				keywords: ["Maintenance"],
				featuredImageKey: "blog/water-heater.webp",
			},
		]);

		await act(async () => {
			root.render(
				<MemoryRouter>
					<BlogPage />
				</MemoryRouter>
			);
		});

		await act(async () => {
			await Promise.resolve();
		});

		expect(container.textContent).toContain("Water Heater Basics");
		expect(container.textContent).not.toContain(
			"No blog posts matched your current search and filter selection."
		);
	});
});