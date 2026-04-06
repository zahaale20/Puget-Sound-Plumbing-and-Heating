import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import LimitedTimeOffersPage from "./LimitedTimeOffersPage";

vi.mock("../components/forms/LimitedTimeOffers", () => ({
	default: () => <div data-testid="limited-time-offers">Offers content</div>,
}));

vi.mock("../services/imageService", () => ({
	getCloudFrontUrl: (key) => `/images/${key || ""}`,
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;
let observerInstances = [];

class IntersectionObserverMock {
	constructor(callback, options) {
		this.callback = callback;
		this.options = options;
		this.observe = vi.fn();
		this.disconnect = vi.fn();
		this.unobserve = vi.fn();
		observerInstances.push(this);
	}
}

class MockImage {
	set src(value) {
		this._src = value;
	}
}

describe("LimitedTimeOffersPage", () => {
	beforeEach(() => {
		observerInstances = [];
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
		globalThis.IntersectionObserver = vi.fn((callback, options) => new IntersectionObserverMock(callback, options));
		window.IntersectionObserver = globalThis.IntersectionObserver;
		globalThis.Image = MockImage;
		window.Image = MockImage;
	});

	afterEach(() => {
		act(() => {
			root.unmount();
		});
		container.remove();
		vi.restoreAllMocks();
	});

	it("keeps the coupon page structure mounted while decorative backgrounds are unresolved", async () => {
		await act(async () => {
			root.render(<LimitedTimeOffersPage />);
		});

		expect(container.textContent).toContain("Coupons");
		expect(container.textContent).toContain("Save on your next service");
		expect(container.querySelector('[data-testid="limited-time-offers"]')).toBeInTheDocument();
		expect(observerInstances).toHaveLength(1);
	});
});