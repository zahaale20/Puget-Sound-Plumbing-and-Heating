import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import LimitedTimeOffers from "./LimitedTimeOffers";

vi.mock("../../services/emailService", () => ({
	redeemOffer: vi.fn(),
}));

vi.mock("../../services/hcaptchaService", () => ({
	getHCaptchaToken: vi.fn(),
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { redeemOffer } = await import("../../services/emailService");
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

async function fillInput(element, value) {
	await act(async () => {
		setElementValue(element, value);
		element.dispatchEvent(new Event("input", { bubbles: true }));
		element.dispatchEvent(new Event("change", { bubbles: true }));
	});
}

describe("LimitedTimeOffers", () => {
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

	it("keeps the modal fields visible while submit feedback stays local to the action and response region", async () => {
		const deferred = createDeferred();
		getHCaptchaToken.mockResolvedValue("captcha-token");
		redeemOffer.mockReturnValue(deferred.promise);

		await act(async () => {
			root.render(<LimitedTimeOffers textColor="text-[#0C2D70]" />);
		});

		const openButton = Array.from(container.querySelectorAll("button")).find((button) =>
			button.textContent.includes("Redeem Offer")
		);

		await act(async () => {
			openButton.click();
		});

		await fillInput(document.body.querySelector('input[name="firstName"]'), "Alex");
		await fillInput(document.body.querySelector('input[name="lastName"]'), "Zaharia");
		await fillInput(document.body.querySelector('input[name="email"]'), "alex@example.com");
		await fillInput(document.body.querySelector('input[name="phone"]'), "2065551212");

		const form = document.body.querySelector("form");

		await act(async () => {
			form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
			await Promise.resolve();
		});

		const submitButton = Array.from(document.body.querySelectorAll("button")).find((button) =>
			button.textContent.includes("Submit Request")
		);

		expect(document.body.textContent).toContain("Redeem Offer:");
		expect(document.body.textContent).toContain("First Name");
		expect(document.body.textContent).toContain("Last Name");
		expect(submitButton).toBeDisabled();
		expect(submitButton.textContent).toContain("Submit Request");
		expect(submitButton.textContent).toContain("Submitting request...");

		await act(async () => {
			deferred.resolve({ duplicate: true, message: "This request already exists." });
			await deferred.promise;
			await Promise.resolve();
		});

		expect(document.body.textContent).toContain("This request already exists.");
		expect(redeemOffer).toHaveBeenCalledTimes(1);
	});
});