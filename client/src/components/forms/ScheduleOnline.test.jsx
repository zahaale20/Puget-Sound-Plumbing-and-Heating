import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ScheduleOnline from "./ScheduleOnline";

vi.mock("../../services/emailService", () => ({
	submitSchedule: vi.fn(),
}));

vi.mock("../../services/hcaptchaService", () => ({
	getHCaptchaToken: vi.fn(),
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { submitSchedule } = await import("../../services/emailService");
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

describe("ScheduleOnline", () => {
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

	it("keeps fields visible during submission and blocks duplicate submits while the request is in flight", async () => {
		const deferred = createDeferred();
		getHCaptchaToken.mockResolvedValue("captcha-token");
		submitSchedule.mockReturnValue(deferred.promise);

		await act(async () => {
			root.render(<ScheduleOnline />);
		});

		await fillInput(container.querySelector('input[name="firstName"]'), "Alex");
		await fillInput(container.querySelector('input[name="lastName"]'), "Zaharia");
		await fillInput(container.querySelector('input[name="phone"]'), "2065551212");
		await fillInput(container.querySelector('input[name="email"]'), "alex@example.com");

		const form = container.querySelector("form");

		await act(async () => {
			form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
			await Promise.resolve();
		});

		await act(async () => {
			form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
			await Promise.resolve();
		});

		const submitButton = Array.from(container.querySelectorAll("button")).find((button) =>
			button.textContent.includes("Submit Request")
		);

		expect(container.textContent).toContain("First Name");
		expect(container.textContent).toContain("Last Name");
		expect(submitButton).toBeDisabled();
		expect(submitButton.textContent).toContain("Submit Request");
		expect(submitButton.textContent).toContain("Submitting request...");
		expect(submitSchedule).toHaveBeenCalledTimes(1);

		await act(async () => {
			deferred.resolve({ duplicate: false });
			await deferred.promise;
			await Promise.resolve();
		});

		expect(container.textContent).toContain("Thank you! We'll be in touch soon.");
	});
});