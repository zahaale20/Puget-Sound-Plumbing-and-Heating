import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("../services/emailService", () => ({
	redeemOffer: vi.fn(),
}));

vi.mock("../services/hcaptchaService", () => ({
	getHCaptchaToken: vi.fn(),
}));

import LimitedTimeOffers from "../components/forms/LimitedTimeOffers";
import { redeemOffer } from "../services/emailService";
import { getHCaptchaToken } from "../services/hcaptchaService";

function fillModalForm() {
	const firstNameInput = document.querySelector('.fixed input[name="firstName"]');
	const lastNameInput = document.querySelector('.fixed input[name="lastName"]');
	const emailInput = document.querySelector('.fixed input[name="email"]');
	const phoneInput = document.querySelector('.fixed input[name="phone"]');
	fireEvent.change(firstNameInput, { target: { value: "Jane", name: "firstName" } });
	fireEvent.change(lastNameInput, { target: { value: "Doe", name: "lastName" } });
	fireEvent.change(emailInput, { target: { value: "jane@example.com", name: "email" } });
	fireEvent.change(phoneInput, { target: { value: "2065550000", name: "phone" } });
}

describe("LimitedTimeOffers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders all coupon cards", () => {
		render(<LimitedTimeOffers />);
		expect(screen.getByText("Limited Time Offers")).toBeInTheDocument();
		expect(screen.getByText("$19.50 OFF")).toBeInTheDocument();
		expect(screen.getByText("$59.50 OFF")).toBeInTheDocument();
		expect(screen.getByText("$69.50 OFF")).toBeInTheDocument();
		expect(screen.getByText("$79.75 OFF")).toBeInTheDocument();
	});

	it("opens modal when Redeem Offer is clicked", () => {
		render(<LimitedTimeOffers />);
		const buttons = screen.getAllByText("Redeem Offer");
		fireEvent.click(buttons[0]);

		expect(screen.getByText("Redeem Offer:")).toBeInTheDocument();
		expect(screen.getByLabelText("Close modal")).toBeInTheDocument();
	});

	it("closes modal when close button is clicked", () => {
		render(<LimitedTimeOffers />);
		const buttons = screen.getAllByText("Redeem Offer");
		fireEvent.click(buttons[0]);

		expect(screen.getByText("Redeem Offer:")).toBeInTheDocument();
		fireEvent.click(screen.getByLabelText("Close modal"));

		expect(screen.queryByText("Redeem Offer:")).not.toBeInTheDocument();
	});

	it("shows success on form submission", async () => {
		getHCaptchaToken.mockResolvedValue("test-token");
		redeemOffer.mockResolvedValue({ success: true });

		render(<LimitedTimeOffers />);
		const buttons = screen.getAllByText("Redeem Offer");
		fireEvent.click(buttons[1]); // $59.50 OFF

		// Fill form - inputs don't have name attrs, query by type
		const textInputs = document.querySelectorAll('.fixed input[type="text"]');
		const emailInput = document.querySelector('.fixed input[type="email"]');
		const telInput = document.querySelector('.fixed input[type="tel"]');

		fireEvent.change(textInputs[0], { target: { value: "Jane" } }); // firstName
		fireEvent.change(textInputs[1], { target: { value: "Doe" } }); // lastName
		fireEvent.change(emailInput, { target: { value: "jane@example.com" } });
		fireEvent.change(telInput, { target: { value: "2065550000" } });

		fireEvent.click(screen.getByRole("button", { name: /Submit Request/i }));

		await waitFor(() => {
			expect(screen.getByText("Thank you! We'll be in touch soon.")).toBeInTheDocument();
		});

		expect(redeemOffer).toHaveBeenCalledWith(
			expect.objectContaining({
				firstName: "Jane",
				lastName: "Doe",
				email: "jane@example.com",
				couponDiscount: "$59.50 OFF",
				couponCondition: "ANY SERVICE OVER $250",
			}),
			"test-token"
		);
	});

	it("shows error when captcha fails in modal", async () => {
		getHCaptchaToken.mockResolvedValue(null);

		render(<LimitedTimeOffers />);
		const buttons = screen.getAllByText("Redeem Offer");
		fireEvent.click(buttons[0]);

		fillModalForm();
		const form = document.querySelector(".fixed form");
		fireEvent.submit(form);

		await waitFor(() => {
			expect(
				screen.getByText("Security verification failed. Please refresh and try again.")
			).toBeInTheDocument();
		});
		expect(redeemOffer).not.toHaveBeenCalled();
	});

	it("shows API error in modal", async () => {
		getHCaptchaToken.mockResolvedValue("test-token");
		redeemOffer.mockRejectedValue(new Error("Network failure"));

		render(<LimitedTimeOffers />);
		const buttons = screen.getAllByText("Redeem Offer");
		fireEvent.click(buttons[0]);

		fillModalForm();
		const form = document.querySelector(".fixed form");
		fireEvent.submit(form);

		await waitFor(() => {
			expect(screen.getByText("Network failure")).toBeInTheDocument();
		});
	});

	it("shows duplicate message", async () => {
		getHCaptchaToken.mockResolvedValue("test-token");
		redeemOffer.mockResolvedValue({
			success: true,
			duplicate: true,
			message: "This request already exists.",
		});

		render(<LimitedTimeOffers />);
		const buttons = screen.getAllByText("Redeem Offer");
		fireEvent.click(buttons[0]);

		fillModalForm();
		const form = document.querySelector(".fixed form");
		fireEvent.submit(form);

		await waitFor(() => {
			expect(screen.getByText("This request already exists.")).toBeInTheDocument();
		});
	});

	it("shows email failed message", async () => {
		getHCaptchaToken.mockResolvedValue("test-token");
		redeemOffer.mockResolvedValue({
			success: true,
			emailStatus: "failed",
		});

		render(<LimitedTimeOffers />);
		const buttons = screen.getAllByText("Redeem Offer");
		fireEvent.click(buttons[0]);

		fillModalForm();
		const form = document.querySelector(".fixed form");
		fireEvent.submit(form);

		await waitFor(() => {
			expect(screen.getByText(/couldn't send your coupon email/)).toBeInTheDocument();
		});
	});
});
