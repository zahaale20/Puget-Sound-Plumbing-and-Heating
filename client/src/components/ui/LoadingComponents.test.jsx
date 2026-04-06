import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ImageWithLoader, LazyBackgroundImage } from "./LoadingComponents";

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
		expect(observerInstances).toHaveLength(1);

		act(() => {
			observerInstances[0].trigger(true);
		});

		await act(async () => {
			await Promise.resolve();
		});

		expect(wrapper.style.backgroundImage).toContain("/background.jpg");
	});
});