import { getRouteFallbackPolicy, getRouteFallbackType, ROUTE_FALLBACK_TYPES } from "./routeFallback";

describe("getRouteFallbackType", () => {
	it("maps known route families to the shared minimal route shell", () => {
		expect(getRouteFallbackType("/")).toBe(ROUTE_FALLBACK_TYPES.MINIMAL);
		expect(getRouteFallbackType("/about-us")).toBe(ROUTE_FALLBACK_TYPES.MINIMAL);
		expect(getRouteFallbackType("/blog")).toBe(ROUTE_FALLBACK_TYPES.MINIMAL);
		expect(getRouteFallbackType("/blog/water-heater-guide")).toBe(ROUTE_FALLBACK_TYPES.MINIMAL);
		expect(getRouteFallbackType("/schedule-online")).toBe(ROUTE_FALLBACK_TYPES.MINIMAL);
		expect(getRouteFallbackType("/coupons")).toBe(ROUTE_FALLBACK_TYPES.MINIMAL);
		expect(getRouteFallbackType("/careers")).toBe(ROUTE_FALLBACK_TYPES.MINIMAL);
		expect(getRouteFallbackType("/resources")).toBe(ROUTE_FALLBACK_TYPES.MINIMAL);
		expect(getRouteFallbackType("/faqs")).toBe(ROUTE_FALLBACK_TYPES.MINIMAL);
		expect(getRouteFallbackType("/financing")).toBe(ROUTE_FALLBACK_TYPES.MINIMAL);
		expect(getRouteFallbackType("/warranty")).toBe(ROUTE_FALLBACK_TYPES.MINIMAL);
		expect(getRouteFallbackType("/reviews")).toBe(ROUTE_FALLBACK_TYPES.MINIMAL);
	});

	it("keeps nested service and service-area routes on the same minimal contract", () => {
		expect(getRouteFallbackType("/services")).toBe(ROUTE_FALLBACK_TYPES.MINIMAL);
		expect(getRouteFallbackType("/services/drains")).toBe(ROUTE_FALLBACK_TYPES.MINIMAL);
		expect(getRouteFallbackType("/services/drains/hydro-jetting")).toBe(ROUTE_FALLBACK_TYPES.MINIMAL);
		expect(getRouteFallbackType("/service-areas")).toBe(ROUTE_FALLBACK_TYPES.MINIMAL);
		expect(getRouteFallbackType("/service-areas/seattle")).toBe(ROUTE_FALLBACK_TYPES.MINIMAL);
		expect(getRouteFallbackType("/service-areas/seattle/ballard")).toBe(ROUTE_FALLBACK_TYPES.MINIMAL);
	});

	it("uses the generic not-found shell for unknown routes", () => {
		expect(getRouteFallbackType("/some-random-path")).toBe(ROUTE_FALLBACK_TYPES.NOT_FOUND);
		expect(getRouteFallbackType("/404")).toBe(ROUTE_FALLBACK_TYPES.NOT_FOUND);
		expect(getRouteFallbackType("")).toBe(ROUTE_FALLBACK_TYPES.MINIMAL);
	});
});

describe("getRouteFallbackPolicy", () => {
	it("returns minimal copy for known routes without page-sized skeleton selection", () => {
		expect(getRouteFallbackPolicy("/coupons")).toEqual({
			type: ROUTE_FALLBACK_TYPES.MINIMAL,
			loadingLabel: "Loading content",
			announcement: "Loading page content.",
		});
	});

	it("returns generic copy for unknown routes", () => {
		expect(getRouteFallbackPolicy("/unknown")).toEqual({
			type: ROUTE_FALLBACK_TYPES.NOT_FOUND,
			loadingLabel: "Loading page",
			announcement: "Loading page content.",
		});
	});
});