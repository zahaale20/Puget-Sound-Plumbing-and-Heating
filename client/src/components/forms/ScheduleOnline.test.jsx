import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the network-touching services so we test the form's behaviour, not
// the world. Using vi.mock at top level means the mocks are hoisted and apply
// to the dynamic import below.
vi.mock("../../services/emailService", () => ({
	submitSchedule: vi.fn(),
}));
vi.mock("../../services/hcaptchaService", () => ({
	getHCaptchaToken: vi.fn(),
}));

import { submitSchedule } from "../../services/emailService";
import { getHCaptchaToken } from "../../services/hcaptchaService";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

beforeEach(() => {
	vi.clearAllMocks();
	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => {
		root.unmount();
	});
	container.remove();
	container = null;
	root = null;
});

async function renderForm() {
	const { default: ScheduleOnline } = await import("./ScheduleOnline.jsx");
	await act(async () => {
		root.render(<ScheduleOnline />);
	});
	return container.querySelector("form");
}

function setInputValue(form, name, value) {
	const input = form.querySelector(`[name="${name}"]`);
	const setter = Object.getOwnPropertyDescriptor(
		input.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
		"value",
	).set;
	setter.call(input, value);
	input.dispatchEvent(new Event("input", { bubbles: true }));
	input.dispatchEvent(new Event("change", { bubbles: true }));
	return input;
}

function blur(input) {
	// React's onBlur maps to the bubbling `focusout` event at the root,
	// not native `blur` (which doesn't bubble).
	input.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
}

describe("ScheduleOnline form", () => {
	it("renders required fields with proper aria attributes", async () => {
		const form = await renderForm();
		const firstName = form.querySelector("#schedule-firstName");
		expect(firstName.getAttribute("aria-required")).toBe("true");
		expect(firstName.getAttribute("autocomplete")).toBe("given-name");
		expect(form.querySelector("#schedule-email").getAttribute("autocomplete")).toBe("email");
	});

	it("does not submit when required fields are empty", async () => {
		const form = await renderForm();
		await act(async () => {
			form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
		});
		expect(submitSchedule).not.toHaveBeenCalled();
		expect(getHCaptchaToken).not.toHaveBeenCalled();
	});

	it("marks fields invalid on blur when validation fails", async () => {
		const form = await renderForm();
		const email = setInputValue(form, "email", "not-an-email");
		await act(async () => {
			blur(email);
		});
		expect(email.getAttribute("aria-invalid")).toBe("true");
		// Error is announced via role=alert.
		expect(form.querySelector("#schedule-email-error[role='alert']")).not.toBeNull();
	});

	it("submits valid form, includes captcha token, and clears fields on success", async () => {
		getHCaptchaToken.mockResolvedValueOnce("captcha-token-123");
		submitSchedule.mockResolvedValueOnce({ success: true });

		const form = await renderForm();
		setInputValue(form, "firstName", "Ada");
		setInputValue(form, "lastName", "Lovelace");
		setInputValue(form, "phone", "2065551234");
		setInputValue(form, "email", "ada@example.com");
		setInputValue(form, "message", "Need a quote");

		await act(async () => {
			form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
		});
		// flush promise microtasks
		await act(async () => {
			await Promise.resolve();
			await Promise.resolve();
		});

		expect(getHCaptchaToken).toHaveBeenCalledTimes(1);
		expect(submitSchedule).toHaveBeenCalledTimes(1);
		const [payload, token] = submitSchedule.mock.calls[0];
		expect(payload).toMatchObject({
			firstName: "Ada",
			lastName: "Lovelace",
			email: "ada@example.com",
		});
		expect(token).toBe("captcha-token-123");

		// Fields reset after success.
		expect(form.querySelector("#schedule-firstName").value).toBe("");
	});

	it("shows error and does not reset when captcha token is missing", async () => {
		getHCaptchaToken.mockResolvedValueOnce(null);

		const form = await renderForm();
		setInputValue(form, "firstName", "Ada");
		setInputValue(form, "lastName", "Lovelace");
		setInputValue(form, "phone", "2065551234");
		setInputValue(form, "email", "ada@example.com");

		await act(async () => {
			form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
		});
		await act(async () => {
			await Promise.resolve();
		});

		expect(submitSchedule).not.toHaveBeenCalled();
		// Field values are preserved so the user can retry.
		expect(form.querySelector("#schedule-firstName").value).toBe("Ada");
	});
});
