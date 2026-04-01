import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("../services/emailService", () => ({
	submitJobApplication: vi.fn(),
}));

vi.mock("../services/hcaptchaService", () => ({
	getHCaptchaToken: vi.fn(),
}));

vi.mock("../data/data", () => ({
	openings: [
		{ name: "Licensed Residential Plumber", location: "Seattle, WA", type: "Full Time" },
		{ name: "HVAC Technician", location: "Burien, WA", type: "Full Time" },
	],
}));

import JobApplicationForm from "../components/forms/JobApplicationForm";
import { submitJobApplication } from "../services/emailService";
import { getHCaptchaToken } from "../services/hcaptchaService";

function getInput(container, name) {
	return container.querySelector(`[name="${name}"]`);
}

function fillValidForm(container) {
	fireEvent.change(getInput(container, "firstName"), { target: { value: "Jane", name: "firstName" } });
	fireEvent.change(getInput(container, "lastName"), { target: { value: "Smith", name: "lastName" } });
	fireEvent.change(getInput(container, "phone"), { target: { value: "2065551234", name: "phone" } });
	fireEvent.change(getInput(container, "email"), { target: { value: "jane@example.com", name: "email" } });
	// Select a position
	fireEvent.click(screen.getByText("Select a position"));
	fireEvent.click(screen.getByText("Licensed Residential Plumber"));
}

describe("JobApplicationForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders all form fields", () => {
		const { container } = render(<JobApplicationForm />);
		expect(screen.getByText(/First Name/)).toBeInTheDocument();
		expect(screen.getByText(/Last Name/)).toBeInTheDocument();
		expect(screen.getByText(/Phone/)).toBeInTheDocument();
		expect(screen.getByText(/Email/)).toBeInTheDocument();
		expect(screen.getByText("Position")).toBeInTheDocument();
		expect(screen.getByText("Resume")).toBeInTheDocument();
		expect(getInput(container, "firstName")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Apply Now/i })).toBeInTheDocument();
	});

	it("opens position dropdown and selects a position", () => {
		render(<JobApplicationForm />);
		fireEvent.click(screen.getByText("Select a position"));
		expect(screen.getByText("Licensed Residential Plumber")).toBeInTheDocument();
		expect(screen.getByText("HVAC Technician")).toBeInTheDocument();

		fireEvent.click(screen.getByText("HVAC Technician"));
		expect(screen.getByText("HVAC Technician")).toBeInTheDocument();
	});

	it("shows success on successful submission", async () => {
		getHCaptchaToken.mockResolvedValue("test-token");
		submitJobApplication.mockResolvedValue({ success: true });

		const { container } = render(<JobApplicationForm />);
		fillValidForm(container);
		fireEvent.submit(container.querySelector("form"));

		await waitFor(() => {
			expect(screen.getByText("Thank you! We'll be in touch soon.")).toBeInTheDocument();
		});
		expect(submitJobApplication).toHaveBeenCalledOnce();
	});

	it("shows error when captcha fails", async () => {
		getHCaptchaToken.mockResolvedValue(null);

		const { container } = render(<JobApplicationForm />);
		fillValidForm(container);
		fireEvent.submit(container.querySelector("form"));

		await waitFor(() => {
			expect(
				screen.getByText("Security verification failed. Please refresh and try again.")
			).toBeInTheDocument();
		});
		expect(submitJobApplication).not.toHaveBeenCalled();
	});

	it("shows error on API failure", async () => {
		getHCaptchaToken.mockResolvedValue("test-token");
		submitJobApplication.mockRejectedValue(new Error("Server error"));

		const { container } = render(<JobApplicationForm />);
		fillValidForm(container);
		fireEvent.submit(container.querySelector("form"));

		await waitFor(() => {
			expect(screen.getByText("Server error")).toBeInTheDocument();
		});
	});

	it("shows duplicate message", async () => {
		getHCaptchaToken.mockResolvedValue("test-token");
		submitJobApplication.mockResolvedValue({
			success: true,
			duplicate: true,
			message: "This application already exists.",
		});

		const { container } = render(<JobApplicationForm />);
		fillValidForm(container);
		fireEvent.submit(container.querySelector("form"));

		await waitFor(() => {
			expect(screen.getByText("This application already exists.")).toBeInTheDocument();
		});
	});

	it("disables button during submission", async () => {
		let resolveSubmit;
		getHCaptchaToken.mockResolvedValue("test-token");
		submitJobApplication.mockImplementation(
			() => new Promise((resolve) => (resolveSubmit = resolve))
		);

		const { container } = render(<JobApplicationForm />);
		fillValidForm(container);
		fireEvent.submit(container.querySelector("form"));

		await waitFor(() => {
			expect(screen.getByText("Submitting...")).toBeInTheDocument();
		});

		resolveSubmit({ success: true });
		await waitFor(() => {
			expect(screen.getByText("Thank you! We'll be in touch soon.")).toBeInTheDocument();
		});
	});
});
