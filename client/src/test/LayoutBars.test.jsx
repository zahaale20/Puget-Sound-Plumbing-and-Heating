import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../services/imageService", () => ({
	getCloudFrontUrl: vi.fn((path) => `https://cdn.example.com/${path}`),
}));

import EmergencyBar from "../components/layout/EmergencyBar";
import FinancingBar from "../components/layout/FinancingBar";

describe("EmergencyBar", () => {
	it("renders 24/7 emergency text", () => {
		render(<EmergencyBar />);
		expect(screen.getByText(/24\/7 Emergency Service/)).toBeInTheDocument();
	});

	it("renders phone number as a link", () => {
		render(<EmergencyBar />);
		const link = screen.getByRole("link");
		expect(link).toHaveAttribute("href", "tel:206-938-3219");
		expect(link.textContent).toContain("(206) 938-3219");
	});
});

describe("FinancingBar", () => {
	it("renders financing text", () => {
		render(<FinancingBar />);
		expect(screen.getByText("Easy Financing Available")).toBeInTheDocument();
	});

	it("links to financing URL", () => {
		render(<FinancingBar />);
		const link = screen.getByText("Easy Financing Available").closest("a");
		expect(link).toHaveAttribute("href");
		expect(link.href).toContain("gethearth.com");
	});
});
