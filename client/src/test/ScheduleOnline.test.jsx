import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("../services/emailService", () => ({
	submitSchedule: vi.fn(),
}));

vi.mock("../services/hcaptchaService", () => ({
	getHCaptchaToken: vi.fn(),
}));

import ScheduleOnline from "../components/forms/ScheduleOnline";
import { submitSchedule } from "../services/emailService";
import { getHCaptchaToken } from "../services/hcaptchaService";

function getInput(container, name) {
	return container.querySelector(`[name="${name}"]`);
}

describe("ScheduleOnline", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders the form with all required fields", () => {
		const { container } = render(<ScheduleOnline />);
		expect(screen.getByText("Schedule Online")).toBeInTheDocument();
		expect(screen.getByText(/First Name/)).toBeInTheDocument();
		expect(screen.getByText(/Last Name/)).toBeInTheDocument();
		expect(screen.getByText(/Phone/)).toBeInTheDocument();
		expect(screen.getByText(/Email/)).toBeInTheDocument();
		expect(screen.getByText("Message")).toBeInTheDocument();
		expect(getInput(container, "firstName")).toBeInTheDocument();
		expect(getInput(container, "email")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Submit Request/ })).toBeInTheDocument();
	});

	it("updates input values on change", () => {
		const { container } = render(<ScheduleOnline />);
		const firstNameInput = getInput(container, "firstName");
		fireEvent.change(firstNameInput, { target: { value: "John", name: "firstName" } });
		expect(firstNameInput.value).toBe("John");
	});

	it("shows success message on successful submission", async () => {
		getHCaptchaToken.mockResolvedValue("test-token");
		submitSchedule.mockResolvedValue({ success: true });

		const { container } = render(<ScheduleOnline />);

		fireEvent.change(getInput(container, "firstName"), { target: { value: "John", name: "firstName" } });
		fireEvent.change(getInput(container, "lastName"), { target: { value: "Doe", name: "lastName" } });
		fireEvent.change(getInput(container, "phone"), { target: { value: "2065551234", name: "phone" } });
		fireEvent.change(getInput(container, "email"), { target: { value: "john@example.com", name: "email" } });

		fireEvent.click(screen.getByRole("button", { name: /Submit Request/ }));

		await waitFor(() => {
			expect(screen.getByText("Thank you! We'll be in touch soon.")).toBeInTheDocument();
		});
		expect(getHCaptchaToken).toHaveBeenCalledOnce();
		expect(submitSchedule).toHaveBeenCalledOnce();
	});

	it("shows error when captcha fails", async () => {
		getHCaptchaToken.mockResolvedValue(null);

		const { container } = render(<ScheduleOnline />);
		fireEvent.submit(container.querySelector("form"));

		await waitFor(() => {
			expect(
				screen.getByText("Security verification failed. Please refresh and try again.")
			).toBeInTheDocument();
		});
		expect(submitSchedule).not.toHaveBeenCalled();
	});

	it("shows error on API failure", async () => {
		getHCaptchaToken.mockResolvedValue("test-token");
		submitSchedule.mockRejectedValue(new Error("Server error"));

		const { container } = render(<ScheduleOnline />);
		fireEvent.submit(container.querySelector("form"));

		await waitFor(() => {
			expect(screen.getByText("Server error")).toBeInTheDocument();
		});
	});

	it("shows duplicate message", async () => {
		getHCaptchaToken.mockResolvedValue("test-token");
		submitSchedule.mockResolvedValue({
			success: true,
			duplicate: true,
			message: "A request for this contact already exists.",
		});

		const { container } = render(<ScheduleOnline />);
		fireEvent.submit(container.querySelector("form"));

		await waitFor(() => {
			expect(screen.getByText("A request for this contact already exists.")).toBeInTheDocument();
		});
	});

	it("disables button while submitting", async () => {
		let resolveSubmit;
		getHCaptchaToken.mockResolvedValue("test-token");
		submitSchedule.mockImplementation(
			() => new Promise((resolve) => (resolveSubmit = resolve))
		);

		const { container } = render(<ScheduleOnline />);
		fireEvent.submit(container.querySelector("form"));

		await waitFor(() => {
			expect(screen.getByText("Submitting...")).toBeInTheDocument();
		});

		resolveSubmit({ success: true });
		await waitFor(() => {
			expect(screen.getByText("Thank you! We'll be in touch soon.")).toBeInTheDocument();
		});
	});

	it("shows PGRST205 error message", async () => {
		getHCaptchaToken.mockResolvedValue("test-token");
		const err = new Error("Not found");
		err.code = "PGRST205";
		submitSchedule.mockRejectedValue(err);

		const { container } = render(<ScheduleOnline />);
		fireEvent.submit(container.querySelector("form"));

		await waitFor(() => {
			expect(screen.getByText(/temporarily unavailable/)).toBeInTheDocument();
		});
	});
});
