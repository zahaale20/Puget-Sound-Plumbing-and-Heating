import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../services/emailService", () => ({
	submitDiyPermit: vi.fn(),
}));
vi.mock("../../services/hcaptchaService", () => ({
	getHCaptchaToken: vi.fn(),
}));

import { submitDiyPermit } from "../../services/emailService";
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
	const { default: DIYPlumbingPermit } = await import("./DIYPlumbingPermit.jsx");
	await act(async () => {
		root.render(<DIYPlumbingPermit />);
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
	input.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
}

describe("DIYPlumbingPermit form", () => {
	it("does not submit when required fields are empty", async () => {
		const form = await renderForm();
		await act(async () => {
			form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
		});
		expect(submitDiyPermit).not.toHaveBeenCalled();
		expect(getHCaptchaToken).not.toHaveBeenCalled();
	});

	it("marks invalid email on blur", async () => {
		const form = await renderForm();
		const email = setInputValue(form, "email", "not-an-email");
		await act(async () => {
			blur(email);
		});
		expect(form.querySelector("[role='alert']")).not.toBeNull();
		expect(email.className.includes("border-red-500")).toBe(true);
	});

	it("submits valid form with captcha token and resets fields on success", async () => {
		getHCaptchaToken.mockResolvedValueOnce("captcha-token-123");
		submitDiyPermit.mockResolvedValueOnce({ success: true });

		const form = await renderForm();
		setInputValue(form, "firstName", "Ada");
		setInputValue(form, "lastName", "Lovelace");
		setInputValue(form, "email", "ada@example.com");
		setInputValue(form, "phone", "2065551234");
		setInputValue(form, "address", "123 Main St");
		setInputValue(form, "projectDescription", "Replace water line");

		await act(async () => {
			form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
		});
		await act(async () => {
			await Promise.resolve();
			await Promise.resolve();
		});

		expect(getHCaptchaToken).toHaveBeenCalledTimes(1);
		expect(submitDiyPermit).toHaveBeenCalledTimes(1);
		const [payload, token] = submitDiyPermit.mock.calls[0];
		expect(payload).toMatchObject({
			firstName: "Ada",
			lastName: "Lovelace",
			email: "ada@example.com",
			address: "123 Main St",
		});
		expect(payload.phone).toContain("(");
		expect(token).toBe("captcha-token-123");
		expect(form.querySelector("#diy-firstName").value).toBe("");
	});

	it("shows error and preserves fields when captcha token is missing", async () => {
		getHCaptchaToken.mockResolvedValueOnce(null);
		const form = await renderForm();

		setInputValue(form, "firstName", "Ada");
		setInputValue(form, "lastName", "Lovelace");
		setInputValue(form, "email", "ada@example.com");
		setInputValue(form, "phone", "2065551234");
		setInputValue(form, "address", "123 Main St");

		await act(async () => {
			form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
		});
		await act(async () => {
			await Promise.resolve();
		});

		expect(submitDiyPermit).not.toHaveBeenCalled();
		expect(form.querySelector("#diy-firstName").value).toBe("Ada");
		expect(container.textContent).toContain("Security verification failed");
	});
});
