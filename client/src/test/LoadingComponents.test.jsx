import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ImageWithLoader, TextSkeleton, ContentSkeleton } from "../components/ui/LoadingComponents";

describe("ImageWithLoader", () => {
	it("renders image with src and alt", () => {
		render(<ImageWithLoader src="https://example.com/photo.jpg" alt="Test photo" />);
		const img = screen.getByAltText("Test photo");
		expect(img).toHaveAttribute("src", "https://example.com/photo.jpg");
	});

	it("shows loading state initially", () => {
		const { container } = render(
			<ImageWithLoader src="https://example.com/photo.jpg" alt="Test" />
		);
		// Image should have opacity-0 class while loading
		const img = screen.getByAltText("Test");
		expect(img.className).toContain("opacity-0");
	});

	it("removes loading state after image loads", () => {
		render(<ImageWithLoader src="https://example.com/photo.jpg" alt="Test" />);
		const img = screen.getByAltText("Test");
		fireEvent.load(img);
		expect(img.className).toContain("opacity-100");
	});

	it("shows error state when image fails to load", () => {
		render(<ImageWithLoader src="https://example.com/broken.jpg" alt="Broken" />);
		const img = screen.getByAltText("Broken");
		fireEvent.error(img);
		expect(screen.getByText("Image unavailable")).toBeInTheDocument();
	});

	it("applies custom className", () => {
		const { container } = render(
			<ImageWithLoader src="https://example.com/photo.jpg" alt="Test" className="custom-class" />
		);
		expect(container.firstChild.className).toContain("custom-class");
	});

	it("passes loading and decoding attributes", () => {
		render(
			<ImageWithLoader
				src="https://example.com/photo.jpg"
				alt="Test"
				loading="eager"
				decoding="sync"
			/>
		);
		const img = screen.getByAltText("Test");
		expect(img).toHaveAttribute("loading", "eager");
		expect(img).toHaveAttribute("decoding", "sync");
	});
});

describe("TextSkeleton", () => {
	it("renders default 1 line", () => {
		const { container } = render(<TextSkeleton />);
		const lines = container.querySelectorAll(".h-4");
		expect(lines).toHaveLength(1);
	});

	it("renders specified number of lines", () => {
		const { container } = render(<TextSkeleton lines={4} />);
		const lines = container.querySelectorAll(".h-4");
		expect(lines).toHaveLength(4);
	});

	it("last line has 70% width", () => {
		const { container } = render(<TextSkeleton lines={3} />);
		const lines = container.querySelectorAll(".h-4");
		expect(lines[2].style.width).toBe("70%");
	});

	it("non-last lines have 100% width", () => {
		const { container } = render(<TextSkeleton lines={3} />);
		const lines = container.querySelectorAll(".h-4");
		expect(lines[0].style.width).toBe("100%");
		expect(lines[1].style.width).toBe("100%");
	});
});

describe("ContentSkeleton", () => {
	it("renders with animate-pulse class", () => {
		const { container } = render(<ContentSkeleton />);
		expect(container.firstChild.className).toContain("animate-pulse");
	});

	it("renders 3 skeleton bars", () => {
		const { container } = render(<ContentSkeleton />);
		const bars = container.querySelectorAll(".bg-gray-200");
		expect(bars).toHaveLength(3);
	});

	it("applies custom className", () => {
		const { container } = render(<ContentSkeleton className="my-custom" />);
		expect(container.firstChild.className).toContain("my-custom");
	});
});
