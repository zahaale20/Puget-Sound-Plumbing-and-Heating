import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	BlogPostGridSkeleton,
	FormSectionSkeleton,
	ImageWithLoader,
	LazyBackgroundImage,
	LEGACY_ROUTE_SKELETON_EXPORTS,
	LOADING_FIDELITY_PROFILES,
	LoadingButtonContent,
	OfferCardsSkeleton,
	PromoBarSkeleton,
	ServiceRouteSkeleton,
	SHARED_LOADING_CONTRACT,
} from "./LoadingComponents";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let observerInstances = [];
let container;
let root;

class IntersectionObserverMock {
	constructor(callback, options) {
		this.callback = callback;
		this.options = options;
		this.observe = vi.fn();
		this.disconnect = vi.fn();
		this.unobserve = vi.fn();
		observerInstances.push(this);
	}

	trigger(isIntersecting = true) {
		this.callback([{ isIntersecting }]);
	}
}

class MockImage {
	set src(value) {
		this._src = value;
		queueMicrotask(() => {
			if (value.includes("fail")) {
				this.onerror?.(new Event("error"));
				return;
			}

			this.onload?.(new Event("load"));
		});
	}
}

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

function renderComponent(component) {
	act(() => {
		root.render(component);
	});
}

describe("ImageWithLoader", () => {
	it("renders eager images immediately and fades them in after load", () => {
		renderComponent(<ImageWithLoader src="/hero.jpg" alt="Hero" loading="eager" className="h-24 w-24" />);

		const image = container.querySelector('img[src="/hero.jpg"]');

		expect(image).toBeInTheDocument();
		expect(image).toHaveClass("opacity-0");

		act(() => {
			image.dispatchEvent(new Event("load"));
		});

		expect(image).toHaveClass("opacity-100");
	});

	it("waits for viewport intersection before rendering lazy images", () => {
		renderComponent(<ImageWithLoader src="/lazy.jpg" alt="Lazy" className="h-24 w-24" />);

		expect(container.querySelector('img[src="/lazy.jpg"]')).not.toBeInTheDocument();
		expect(observerInstances).toHaveLength(1);

		act(() => {
			observerInstances[0].trigger(true);
		});

		expect(container.querySelector('img[src="/lazy.jpg"]')).toBeInTheDocument();
	});

	it("shows an error state when the image fails to load", () => {
		renderComponent(<ImageWithLoader src="/broken.jpg" alt="Broken" loading="eager" className="h-24 w-24" />);

		const image = container.querySelector('img[src="/broken.jpg"]');

		act(() => {
			image.dispatchEvent(new Event("error"));
		});

		expect(container.textContent).toContain("Image unavailable");
	});

	it("hides decorative failure placeholders from assistive technology", () => {
		renderComponent(
			<ImageWithLoader src="/broken.jpg" alt="" aria-hidden="true" loading="eager" className="h-24 w-24" />
		);

		const image = container.querySelector('img[src="/broken.jpg"]');

		act(() => {
			image.dispatchEvent(new Event("error"));
		});

		expect(container.textContent).not.toContain("Image unavailable");
		expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
	});
});

describe("LazyBackgroundImage", () => {
	it("loads the background image after the wrapper enters the viewport", async () => {
		renderComponent(
			<LazyBackgroundImage src="/background.jpg" className="h-24 w-24" style={{ backgroundColor: "#123456" }}>
				<div>Content</div>
			</LazyBackgroundImage>
		);

		const wrapper = container.firstChild;

		expect(wrapper).toHaveStyle({ backgroundImage: "none" });
		expect(container.textContent).toContain("Content");
		expect(observerInstances).toHaveLength(1);

		act(() => {
			observerInstances[0].trigger(true);
		});

		await act(async () => {
			await Promise.resolve();
		});

		expect(wrapper.style.backgroundImage).toContain("/background.jpg");
	});

	it("keeps children visible and suppresses decorative error text when the background fails", async () => {
		renderComponent(
			<LazyBackgroundImage src="/fail-background.jpg" className="h-24 w-24">
				<div>Content</div>
			</LazyBackgroundImage>
		);

		act(() => {
			observerInstances[0].trigger(true);
		});

		await act(async () => {
			await Promise.resolve();
		});

		expect(container.textContent).toContain("Content");
		expect(container.textContent).not.toContain("Image unavailable");
	});
});

describe("shared loading contract", () => {
	it("keeps route-sized skeletons out of the shared primitive contract", () => {
		const sharedExports = Object.values(SHARED_LOADING_CONTRACT).flat();

		expect(sharedExports).toContain("ImageWithLoader");
		expect(sharedExports).toContain("BlogPostGridSkeleton");
		expect(sharedExports).toContain("LoadingButtonContent");

		for (const legacyExport of LEGACY_ROUTE_SKELETON_EXPORTS) {
			expect(sharedExports).not.toContain(legacyExport);
		}
	});

	it("marks shared fidelity-sensitive skeletons with profile identifiers", () => {
		renderComponent(
			<>
				<PromoBarSkeleton />
				<OfferCardsSkeleton theme="light" />
				<BlogPostGridSkeleton cardCount={2} />
				<FormSectionSkeleton />
			</>
		);

		const profileNames = Array.from(container.querySelectorAll("[data-fidelity-profile]")).map((element) =>
			element.getAttribute("data-fidelity-profile")
		);

		expect(profileNames).toEqual(expect.arrayContaining(["promo-bar", "offer-cards", "blog-post-grid", "form-section"]));
	});

	it("uses orientation metadata to keep promo and warning-sign placeholders in their final stacking direction", () => {
		renderComponent(
			<>
				<OfferCardsSkeleton theme="light" />
				<ServiceRouteSkeleton />
			</>
		);

		const offerCardBody = container.querySelector('[data-fidelity-profile="offer-card-body"]');
		const warningList = container.querySelector('[data-fidelity-profile="warning-sign-list"]');

		expect(offerCardBody).toHaveAttribute("data-fidelity-orientation", LOADING_FIDELITY_PROFILES.offerCards.orientation);
		expect(offerCardBody).toHaveClass("flex-col");
		expect(warningList).toHaveAttribute("data-fidelity-orientation", LOADING_FIDELITY_PROFILES.warningSignList.orientation);
		expect(warningList).toHaveClass("flex-col");
		expect(warningList).not.toHaveClass("grid-cols-2");
	});
});

describe("LoadingButtonContent", () => {
	it("preserves the idle label while exposing a local busy-state announcement", () => {
		renderComponent(
			<button type="button">
				<LoadingButtonContent
					isLoading
					idleLabel="Submit Request"
					loadingLabel="Submitting request..."
				/>
			</button>
		);

		const content = container.querySelector("span[aria-busy]");

		expect(content).toHaveAttribute("aria-busy", "true");
		expect(content).toHaveTextContent("Submit Request");
		expect(content.querySelector(".sr-only")).toHaveTextContent("Submitting request...");
		expect(content.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
	});
});