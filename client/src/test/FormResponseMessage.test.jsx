import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FormResponseMessage from "../components/ui/FormResponseMessage";

describe("FormResponseMessage", () => {
	it("renders nothing when message is null", () => {
		const { container } = render(<FormResponseMessage message={null} />);
		expect(container.innerHTML).toBe("");
	});

	it("renders nothing when message is empty string", () => {
		const { container } = render(<FormResponseMessage message="" />);
		expect(container.innerHTML).toBe("");
	});

	it("renders nothing when message is undefined", () => {
		const { container } = render(<FormResponseMessage />);
		expect(container.innerHTML).toBe("");
	});

	it("renders success message with green styling by default", () => {
		render(<FormResponseMessage message="Thank you!" />);
		const el = screen.getByText("Thank you!");
		expect(el).toBeInTheDocument();
		expect(el.className).toContain("bg-green-100");
		expect(el.className).toContain("text-green-700");
	});

	it("renders error message with red styling", () => {
		render(<FormResponseMessage type="error" message="Something went wrong" />);
		const el = screen.getByText("Something went wrong");
		expect(el).toBeInTheDocument();
		expect(el.className).toContain("bg-red-100");
		expect(el.className).toContain("text-red-700");
	});

	it("renders warning message with orange styling", () => {
		render(<FormResponseMessage type="warning" message="Already subscribed" />);
		const el = screen.getByText("Already subscribed");
		expect(el).toBeInTheDocument();
		expect(el.className).toContain("bg-orange-100");
		expect(el.className).toContain("text-orange-700");
	});

	it("applies custom className", () => {
		render(<FormResponseMessage message="Test" className="w-full text-center" />);
		const el = screen.getByText("Test");
		expect(el.className).toContain("w-full");
		expect(el.className).toContain("text-center");
	});
});
