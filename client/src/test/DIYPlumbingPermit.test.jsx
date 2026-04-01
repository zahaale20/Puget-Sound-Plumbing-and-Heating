import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("../services/emailService", () => ({
	submitDiyPermit: vi.fn(),
}));

vi.mock("../services/hcaptchaService", () => ({
	getHCaptchaToken: vi.fn(),
}));

import DIYPlumbingPermit from "../components/forms/DIYPlumbingPermit";
import { submitDiyPermit } from "../services/emailService";
import { getHCaptchaToken } from "../services/hcaptchaService";

function getInput(container, name) {
	return container.querySelector(`[name="${name}"]`);
}

describe("DIYPlumbingPermit", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders the form with all fields", () => {
		const { container } = render(<DIYPlumbingPermit />);
		expect(screen.getByText(/DIY.*Plumbing Permit/)).toBeInTheDocument();
		expect(screen.getByText(/First Name/)).toBeInTheDocument();
		expect(screen.getByText(/Last Name/)).toBeInTheDocument();
		expect(screen.getByText(/Email/)).toBeInTheDocument();
		expect(screen.getByText(/Phone/)).toBeInTheDocument();
		expect(screen.getByText(/Property Address/)).toBeInTheDocument();
		expect(getInput(container, "firstName")).toBeInTheDocument();
		expect(getInput(container, "address")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Submit Request/i })).toBeInTheDocument();
	});

	it("shows success message on successful submission", async () => {
		getHCaptchaToken.mockResolvedValue("test-token");
		submitDiyPermit.mockResolvedValue({ success: true });

		const { container } = render(<DIYPlumbingPermit />);

		fireEvent.change(getInput(container, "firstName"), { target: { value: "Bob", name: "firstName" } });
		fireEvent.change(getInput(container, "lastName"), { target: { value: "Builder", name: "lastName" } });
		fireEvent.change(getInput(container, "email"), { target: { value: "bob@example.com", name: "email" } });
		fireEvent.change(getInput(container, "phone"), { target: { value: "2065550000", name: "phone" } });
		fireEvent.change(getInput(container, "address"), { target: { value: "123 Main St", name: "address" } });

		fireEvent.click(screen.getByRole("button", { name: /Submit Request/i }));

		await waitFor(() => {
			expect(screen.getByText("Thank you! We'll be in touch soon.")).toBeInTheDocument();
		});
		expect(submitDiyPermit).toHaveBeenCalledOnce();
	});

	it("shows error when captcha fails", async () => {
		getHCaptchaToken.mockResolvedValue(null);

		const { container } = render(<DIYPlumbingPermit />);
		fireEvent.submit(container.querySelector("form"));

		await waitFor(() => {
			expect(
				screen.getByText("Security verification failed. Please refresh and try again.")
			).toBeInTheDocument();
		});
		expect(submitDiyPermit).not.toHaveBeenCalled();
	});

	it("shows error on API failure", async () => {
		getHCaptchaToken.mockResolvedValue("test-token");
		submitDiyPermit.mockRejectedValue(new Error("Network error"));

		const { container } = render(<DIYPlumbingPermit />);
		fireEvent.submit(container.querySelector("form"));

		await waitFor(() => {
			expect(screen.getByText("Network error")).toBeInTheDocument();
		});
	});

	it("shows duplicate message", async () => {
		getHCaptchaToken.mockResolvedValue("test-token");
		submitDiyPermit.mockResolvedValue({
			success: true,
			duplicate: true,
			message: "This request already exists.",
		});

		const { container } = render(<DIYPlumbingPermit />);
		fireEvent.submit(container.querySelector("form"));

		await waitFor(() => {
			expect(screen.getByText("This request already exists.")).toBeInTheDocument();
		});
	});
});
