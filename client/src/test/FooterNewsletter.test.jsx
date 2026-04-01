import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../services/emailService", () => ({
	subscribeNewsletter: vi.fn(),
}));

vi.mock("../services/hcaptchaService", () => ({
	getHCaptchaToken: vi.fn(),
}));

vi.mock("../services/imageService", () => ({
	getCloudFrontUrl: vi.fn((path) => `https://cdn.example.com/${path}`),
}));

vi.mock("../components/ui/LoadingComponents", () => ({
	ImageWithLoader: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />,
}));

import Footer from "../components/layout/Footer";
import { subscribeNewsletter } from "../services/emailService";
import { getHCaptchaToken } from "../services/hcaptchaService";

function renderFooter() {
	return render(
		<MemoryRouter>
			<Footer />
		</MemoryRouter>
	);
}

describe("Footer Newsletter", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders the newsletter form", () => {
		renderFooter();
		expect(screen.getByText("Stay Updated")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Email Address")).toBeInTheDocument();
		expect(screen.getByText("Join Now")).toBeInTheDocument();
	});

	it("subscribes successfully", async () => {
		getHCaptchaToken.mockResolvedValue("test-token");
		subscribeNewsletter.mockResolvedValue({ success: true });

		renderFooter();
		fireEvent.change(screen.getByPlaceholderText("Email Address"), {
			target: { value: "test@example.com" },
		});
		fireEvent.click(screen.getByText("Join Now"));

		await waitFor(() => {
			expect(screen.getByText("Thank you! We'll be in touch soon.")).toBeInTheDocument();
		});
		expect(subscribeNewsletter).toHaveBeenCalledWith("test@example.com", "test-token");
	});

	it("shows error when captcha fails", async () => {
		getHCaptchaToken.mockResolvedValue(null);

		renderFooter();
		fireEvent.change(screen.getByPlaceholderText("Email Address"), {
			target: { value: "test@example.com" },
		});
		fireEvent.click(screen.getByText("Join Now"));

		await waitFor(() => {
			expect(
				screen.getByText("Security verification failed. Please refresh and try again.")
			).toBeInTheDocument();
		});
		expect(subscribeNewsletter).not.toHaveBeenCalled();
	});

	it("shows error on API failure", async () => {
		getHCaptchaToken.mockResolvedValue("test-token");
		subscribeNewsletter.mockRejectedValue(new Error("Subscription failed"));

		renderFooter();
		fireEvent.change(screen.getByPlaceholderText("Email Address"), {
			target: { value: "test@example.com" },
		});
		fireEvent.click(screen.getByText("Join Now"));

		await waitFor(() => {
			expect(screen.getByText("Subscription failed")).toBeInTheDocument();
		});
	});

	it("shows duplicate subscriber message", async () => {
		getHCaptchaToken.mockResolvedValue("test-token");
		subscribeNewsletter.mockResolvedValue({ success: true, duplicate: true });

		renderFooter();
		fireEvent.change(screen.getByPlaceholderText("Email Address"), {
			target: { value: "test@example.com" },
		});
		fireEvent.click(screen.getByText("Join Now"));

		await waitFor(() => {
			expect(
				screen.getByText("This email is already subscribed to our mailing list.")
			).toBeInTheDocument();
		});
	});

	it("disables button while submitting", async () => {
		let resolveSubscribe;
		getHCaptchaToken.mockResolvedValue("test-token");
		subscribeNewsletter.mockImplementation(
			() => new Promise((resolve) => (resolveSubscribe = resolve))
		);

		renderFooter();
		fireEvent.change(screen.getByPlaceholderText("Email Address"), {
			target: { value: "test@example.com" },
		});
		fireEvent.click(screen.getByText("Join Now"));

		await waitFor(() => {
			expect(screen.getByText("...")).toBeInTheDocument();
		});

		resolveSubscribe({ success: true });
		await waitFor(() => {
			expect(screen.getByText("Thank you! We'll be in touch soon.")).toBeInTheDocument();
		});
	});
});
