import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Footer from "./Footer";

vi.mock("../../services/emailService", () => ({
	subscribeNewsletter: vi.fn(),
}));

vi.mock("../../services/hcaptchaService", () => ({
	getHCaptchaToken: vi.fn(),
}));

vi.mock("../../services/imageService", () => ({
	getCloudFrontUrl: (key) => `/images/${key || ""}`,
}));

vi.mock("../ui/LoadingComponents", async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		ImageWithLoader: ({ src, alt, className = "", ...props }) => (
			<img src={src} alt={alt} className={className} {...props} />
		),
		LazyBackgroundImage: ({ children, className = "", ...props }) => (
			<div className={className} {...props}>
				{children}
			</div>
		),
	};
});

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { subscribeNewsletter } = await import("../../services/emailService");
const { getHCaptchaToken } = await import("../../services/hcaptchaService");

let container;
let root;

function createDeferred() {
	let resolve;
	const promise = new Promise((resolver) => {
		resolve = resolver;
	});
	return { promise, resolve };
}

function setElementValue(element, value) {
	const prototype = Object.getPrototypeOf(element);
	const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
	descriptor?.set?.call(element, value);
}

describe("Footer", () => {
	beforeEach(() => {
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
		vi.clearAllMocks();
	});

	afterEach(() => {
		act(() => {
			root.unmount();
		});
		container.remove();
		vi.restoreAllMocks();
	});

	it("keeps the newsletter form visible while submit feedback stays local to the footer form region", async () => {
		const deferred = createDeferred();
		getHCaptchaToken.mockResolvedValue("captcha-token");
		subscribeNewsletter.mockReturnValue(deferred.promise);

		await act(async () => {
			root.render(
				<MemoryRouter>
					<Footer />
				</MemoryRouter>
			);
		});

		const emailInput = container.querySelector('input[type="email"]');

		await act(async () => {
			setElementValue(emailInput, "alex@example.com");
			emailInput.dispatchEvent(new Event("input", { bubbles: true }));
			emailInput.dispatchEvent(new Event("change", { bubbles: true }));
		});

		const form = container.querySelector("form");

		await act(async () => {
			form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
			await Promise.resolve();
		});

		const submitButton = Array.from(container.querySelectorAll("button")).find((button) =>
			button.textContent.includes("Join Now")
		);

		expect(container.textContent).toContain("Stay Updated");
		expect(container.textContent).toContain("Join our mailing list");
		expect(emailInput).toBeInTheDocument();
		expect(submitButton).toBeDisabled();
		expect(submitButton.textContent).toContain("Join Now");
		expect(submitButton.textContent).toContain("Joining newsletter...");

		await act(async () => {
			deferred.resolve({ duplicate: true });
			await deferred.promise;
			await Promise.resolve();
		});

		expect(container.textContent).toContain("already subscribed to our mailing list");
	});
});