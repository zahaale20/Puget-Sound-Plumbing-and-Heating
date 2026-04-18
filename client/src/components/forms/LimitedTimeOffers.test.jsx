import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../services/emailService", () => ({
	redeemOffer: vi.fn(),
}));
vi.mock("../../services/hcaptchaService", () => ({
	getHCaptchaToken: vi.fn(),
}));

import { redeemOffer } from "../../services/emailService";
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

async function renderOffers() {
	const { default: LimitedTimeOffers } = await import("./LimitedTimeOffers.jsx");
	await act(async () => {
		root.render(<LimitedTimeOffers />);
	});
}

async function clickFirstRedeemButton() {
	const buttons = Array.from(container.querySelectorAll("button"));
	const redeemButton = buttons.find((btn) => btn.textContent.includes("Redeem Offer"));
	await act(async () => {
		redeemButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
	});
}

function setInputValue(name, value) {
	const input = document.body.querySelector(`[name="${name}"]`);
	expect(input).not.toBeNull();
	const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
	setter.call(input, value);
	input.dispatchEvent(new Event("input", { bubbles: true }));
	input.dispatchEvent(new Event("change", { bubbles: true }));
	return input;
}

describe("LimitedTimeOffers", () => {
	it("opens modal when redeem offer is clicked", async () => {
		await renderOffers();
		await clickFirstRedeemButton();
		expect(document.body.textContent).toContain("Redeem Offer:");
	});

	it("does not submit when required fields are empty", async () => {
		await renderOffers();
		await clickFirstRedeemButton();

		const form = document.body.querySelector("form");
		await act(async () => {
			form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
		});

		expect(redeemOffer).not.toHaveBeenCalled();
		expect(getHCaptchaToken).not.toHaveBeenCalled();
	});

	it("submits valid offer request with captcha token", async () => {
		getHCaptchaToken.mockResolvedValueOnce("captcha-token-789");
		redeemOffer.mockResolvedValueOnce({ success: true });

		await renderOffers();
		await clickFirstRedeemButton();
		setInputValue("firstName", "Margaret");
		setInputValue("lastName", "Hamilton");
		setInputValue("email", "margaret@example.com");
		setInputValue("phone", "2065557777");

		const form = document.body.querySelector("form");
		await act(async () => {
			form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
		});
		await act(async () => {
			await Promise.resolve();
			await Promise.resolve();
		});

		expect(getHCaptchaToken).toHaveBeenCalledTimes(1);
		expect(redeemOffer).toHaveBeenCalledTimes(1);
		const [payload, token] = redeemOffer.mock.calls[0];
		expect(payload).toMatchObject({
			firstName: "Margaret",
			lastName: "Hamilton",
			email: "margaret@example.com",
			couponDiscount: "$19.50 OFF",
		});
		expect(payload.couponCondition).toContain("ANY SERVICE");
		expect(token).toBe("captcha-token-789");
	});

	it("shows error and does not redeem when captcha token is missing", async () => {
		getHCaptchaToken.mockResolvedValueOnce(null);

		await renderOffers();
		await clickFirstRedeemButton();
		setInputValue("firstName", "Margaret");
		setInputValue("lastName", "Hamilton");
		setInputValue("email", "margaret@example.com");
		setInputValue("phone", "2065557777");

		const form = document.body.querySelector("form");
		await act(async () => {
			form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
		});
		await act(async () => {
			await Promise.resolve();
		});

		expect(redeemOffer).not.toHaveBeenCalled();
		expect(document.body.textContent).toContain("Security verification failed");
	});
});
