import { getRouteFallbackType, ROUTE_FALLBACK_TYPES } from "./routeFallback";

describe("getRouteFallbackType", () => {
	it("maps page-specific routes to their dedicated fallback types", () => {
		expect(getRouteFallbackType("/")).toBe(ROUTE_FALLBACK_TYPES.HOME);
		expect(getRouteFallbackType("/blog")).toBe(ROUTE_FALLBACK_TYPES.BLOG_INDEX);
		expect(getRouteFallbackType("/blog/water-heater-guide")).toBe(
			ROUTE_FALLBACK_TYPES.BLOG_POST
		);
		expect(getRouteFallbackType("/schedule-online")).toBe(ROUTE_FALLBACK_TYPES.SCHEDULE);
		expect(getRouteFallbackType("/coupons")).toBe(ROUTE_FALLBACK_TYPES.COUPONS);
	});

	it("groups service-oriented routes under the service fallback", () => {
		expect(getRouteFallbackType("/services")).toBe(ROUTE_FALLBACK_TYPES.SERVICE);
		expect(getRouteFallbackType("/services/drains")).toBe(ROUTE_FALLBACK_TYPES.SERVICE);
		expect(getRouteFallbackType("/services/drains/hydro-jetting")).toBe(
			ROUTE_FALLBACK_TYPES.SERVICE
		);
		expect(getRouteFallbackType("/service-areas")).toBe(ROUTE_FALLBACK_TYPES.SERVICE);
		expect(getRouteFallbackType("/service-areas/seattle/ballard")).toBe(
			ROUTE_FALLBACK_TYPES.SERVICE
		);
	});

	it("falls back to the default loader for other pages", () => {
		expect(getRouteFallbackType("/about-us")).toBe(ROUTE_FALLBACK_TYPES.DEFAULT);
		expect(getRouteFallbackType("/resources")).toBe(ROUTE_FALLBACK_TYPES.DEFAULT);
		expect(getRouteFallbackType("")).toBe(ROUTE_FALLBACK_TYPES.HOME);
	});
});