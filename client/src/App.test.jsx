import { act } from "react";
import { createRoot } from "react-dom/client";
import { Link, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

	trigger(isIntersecting = true) {
		this.callback([{ isIntersecting }]);
	}
}

function createDeferred() {
	let resolve;
	const promise = new Promise((resolver) => {
		resolve = resolver;
	});

	return { promise, resolve };
}

function createPageComponent(testId, deferred) {
	let resolved = !deferred;

	if (deferred) {
		deferred.promise.then(() => {
			resolved = true;
		});
	}

	return function MockPage() {
		if (!resolved) {
			throw deferred.promise;
		}

		return <div data-testid={testId}>{testId}</div>;
	};
}

async function loadApp({ suspendedRoute = null, suspendedFooter = false } = {}) {
	vi.resetModules();

	const deferreds = {
		home: suspendedRoute === "home" ? createDeferred() : null,
		blog: suspendedRoute === "blog" ? createDeferred() : null,
		coupons: suspendedRoute === "coupons" ? createDeferred() : null,
		"schedule-online": suspendedRoute === "schedule-online" ? createDeferred() : null,
		"service-category": suspendedRoute === "service-category" ? createDeferred() : null,
		footer: suspendedFooter ? createDeferred() : null,
	};

	vi.doMock("./components/layout/Header", () => ({
		default: function MockHeader() {
			return (
				<header data-testid="header">
					<nav>
						<Link to="/">Home</Link>
						<Link to="/blog">Blog</Link>
						<Link to="/coupons">Coupons</Link>
					</nav>
				</header>
			);
		},
	}));

	vi.doMock("./components/seo/RouteSeo", () => ({
		default: function MockRouteSeo() {
			const location = useLocation();
			return <div data-testid="route-seo">{location.pathname}</div>;
		},
	}));

	vi.doMock("./components/ui/LoadingComponents", () => ({
		FooterSkeleton: function MockFooterSkeleton() {
			return <div data-testid="footer-skeleton">Footer loading</div>;
		},
	}));

	vi.doMock("./components/layout/Footer", () => ({
		default: createPageComponent("footer", deferreds.footer),
	}));

	const pageMocks = [
		["./pages/HomePage", "home", deferreds.home],
		["./pages/ScheduleOnlinePage", "schedule-online", deferreds["schedule-online"]],
		["./pages/BlogPage", "blog", deferreds.blog],
		["./pages/BlogPostPage", "blog-post", null],
		["./pages/CareersPage", "careers", null],
		["./pages/LimitedTimeOffersPage", "coupons", deferreds.coupons],
		["./pages/ResourcesPage", "resources", null],
		["./pages/AboutUsPage", "about-us", null],
		["./pages/FAQsPage", "faqs", null],
		["./pages/ServiceAreasPage", "service-areas", null],
		["./pages/RegionsPage", "region", null],
		["./pages/AreaPage", "area", null],
		["./pages/ServiceCategoriesPage", "service-categories", null],
		["./pages/ServiceCategoryPage", "service-category", deferreds["service-category"]],
		["./pages/ServicePage", "service", null],
		["./pages/FinancingPage", "financing", null],
		["./pages/WarrantyPage", "warranty", null],
		["./pages/CustomerReviewsPage", "reviews", null],
		["./pages/NotFoundPage", "not-found", null],
	];

	for (const [modulePath, testId, deferred] of pageMocks) {
		vi.doMock(modulePath, () => ({
			default: createPageComponent(testId, deferred),
		}));
	}

	const { default: App } = await import("./App.jsx");

	return { App, deferreds };
}

async function flushPromises() {
	await act(async () => {
		await Promise.resolve();
	});
}

async function resolveDeferred(deferred) {
	deferred.resolve();
	await act(async () => {
		await deferred.promise;
		await Promise.resolve();
	});
}

describe("App route shell", () => {
	beforeEach(() => {
		observerInstances = [];
		window.history.replaceState({}, "", "/");
		window.scrollTo = vi.fn();
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
		globalThis.IntersectionObserver = vi.fn((callback, options) => new IntersectionObserverMock(callback, options));
		window.IntersectionObserver = globalThis.IntersectionObserver;
	});

	afterEach(() => {
		act(() => {
			root.unmount();
		});
		container.remove();
		vi.restoreAllMocks();
		vi.resetModules();
	});

	it.each([
		["/", "home"],
		["/blog", "blog"],
		["/coupons", "coupons"],
		["/services/drains", "service-category"],
		["/schedule-online", "schedule-online"],
	])("keeps the header, main shell, and route SEO mounted while %s suspends", async (pathname, routeId) => {
		window.history.replaceState({}, "", pathname);
		const { App, deferreds } = await loadApp({ suspendedRoute: routeId });

		await act(async () => {
			root.render(<App />);
		});

		expect(container.querySelector('[data-testid="header"]')).toBeInTheDocument();
		expect(container.querySelector("main")).toBeInTheDocument();
		expect(container.querySelector('[data-testid="route-seo"]')).toHaveTextContent(pathname);
		expect(container.querySelector('[data-testid="route-shell-loading"]')).toBeInTheDocument();
		expect(container.textContent).toContain("Loading content");

		await resolveDeferred(deferreds[routeId]);

		expect(container.querySelector(`[data-testid="${routeId}"]`)).toBeInTheDocument();
		expect(container.querySelector('[data-testid="route-shell-loading"]')).not.toBeInTheDocument();
	});

	it("keeps footer loading scoped to the deferred footer boundary", async () => {
		window.history.replaceState({}, "", "/blog");
		const { App, deferreds } = await loadApp({ suspendedFooter: true });

		await act(async () => {
			root.render(<App />);
		});

		await flushPromises();

		expect(container.querySelector('[data-testid="blog"]')).toBeInTheDocument();
		expect(observerInstances).toHaveLength(1);
		expect(container.querySelector('[data-testid="footer-skeleton"]')).not.toBeInTheDocument();

		await act(async () => {
			observerInstances[0].trigger(true);
		});

		expect(container.querySelector('[data-testid="blog"]')).toBeInTheDocument();
		expect(container.querySelector('[data-testid="footer-skeleton"]')).toBeInTheDocument();
		expect(container.querySelector('[data-testid="route-shell-loading"]')).not.toBeInTheDocument();

		await resolveDeferred(deferreds.footer);

		expect(container.querySelector('[data-testid="footer"]')).toBeInTheDocument();
		expect(container.querySelector('[data-testid="blog"]')).toBeInTheDocument();
	});
});