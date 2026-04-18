import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../services/emailService", () => ({
	submitJobApplication: vi.fn(),
}));
vi.mock("../../services/hcaptchaService", () => ({
	getHCaptchaToken: vi.fn(),
}));

import { submitJobApplication } from "../../services/emailService";
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
	const { default: JobApplicationForm } = await import("./JobApplicationForm.jsx");
	await act(async () => {
		root.render(<JobApplicationForm />);
	});
	return container.querySelector("form");
}

function setInputValue(form, name, value) {
	const input = form.querySelector(`[name="${name}"]`);
	const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
	setter.call(input, value);
	input.dispatchEvent(new Event("input", { bubbles: true }));
	input.dispatchEvent(new Event("change", { bubbles: true }));
	return input;
}

async function selectPosition(form, label) {
	const trigger = Array.from(form.querySelectorAll("div")).find(
		(el) =>
			typeof el.className === "string" &&
			el.className.includes("cursor-pointer") &&
			el.textContent.includes("Select a position"),
	);

	await act(async () => {
		trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
	});

	const option = Array.from(form.querySelectorAll("li")).find((li) => li.textContent.includes(label));
	await act(async () => {
		option.dispatchEvent(new MouseEvent("click", { bubbles: true }));
	});
}

describe("JobApplicationForm", () => {
	it("does not submit when required fields are empty", async () => {
		const form = await renderForm();
		await act(async () => {
			form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
		});
		expect(submitJobApplication).not.toHaveBeenCalled();
		expect(getHCaptchaToken).not.toHaveBeenCalled();
	});

	it("shows position options and selects one", async () => {
		const form = await renderForm();
		await selectPosition(form, "Licensed Residential Plumber");
		expect(container.textContent).toContain("Licensed Residential Plumber");
	});

	it("submits valid form with resume and captcha token", async () => {
		getHCaptchaToken.mockResolvedValueOnce("captcha-token-456");
		submitJobApplication.mockResolvedValueOnce({ success: true });

		const form = await renderForm();
		setInputValue(form, "firstName", "Grace");
		setInputValue(form, "lastName", "Hopper");
		setInputValue(form, "phone", "2065559999");
		setInputValue(form, "email", "grace@example.com");
		await selectPosition(form, "Licensed Residential Plumber");

		const resumeInput = form.querySelector("#job-resume");
		const file = new File(["resume content"], "resume.pdf", { type: "application/pdf" });
		Object.defineProperty(resumeInput, "files", {
			value: [file],
			configurable: true,
		});
		resumeInput.dispatchEvent(new Event("change", { bubbles: true }));

		await act(async () => {
			form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
		});
		await act(async () => {
			await Promise.resolve();
			await Promise.resolve();
		});

		expect(getHCaptchaToken).toHaveBeenCalledTimes(1);
		expect(submitJobApplication).toHaveBeenCalledTimes(1);
		const [payload, resumeFile, token] = submitJobApplication.mock.calls[0];
		expect(payload).toMatchObject({
			firstName: "Grace",
			lastName: "Hopper",
			email: "grace@example.com",
			position: "Licensed Residential Plumber",
		});
		expect(resumeFile?.name).toBe("resume.pdf");
		expect(token).toBe("captcha-token-456");
		expect(form.querySelector("#job-firstName").value).toBe("");
	});

	it("shows error and does not submit when captcha token is missing", async () => {
		getHCaptchaToken.mockResolvedValueOnce(null);

		const form = await renderForm();
		setInputValue(form, "firstName", "Grace");
		setInputValue(form, "lastName", "Hopper");
		setInputValue(form, "phone", "2065559999");
		setInputValue(form, "email", "grace@example.com");
		await selectPosition(form, "Licensed Residential Plumber");

		await act(async () => {
			form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
		});
		await act(async () => {
			await Promise.resolve();
		});

		expect(submitJobApplication).not.toHaveBeenCalled();
		expect(container.textContent).toContain("Security verification failed");
	});
});
