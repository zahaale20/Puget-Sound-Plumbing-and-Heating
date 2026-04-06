import { getRouteFallbackType, ROUTE_FALLBACK_TYPES } from "./routeFallback";

describe("getRouteFallbackType", () => {
	it("maps page-specific routes to their dedicated fallback types", () => {
		expect(getRouteFallbackType("/")).toBe(ROUTE_FALLBACK_TYPES.HOME);
		expect(getRouteFallbackType("/about-us")).toBe(ROUTE_FALLBACK_TYPES.ABOUT);
		expect(getRouteFallbackType("/blog")).toBe(ROUTE_FALLBACK_TYPES.BLOG_INDEX);
		expect(getRouteFallbackType("/blog/water-heater-guide")).toBe(
			ROUTE_FALLBACK_TYPES.BLOG_POST
		);
		expect(getRouteFallbackType("/schedule-online")).toBe(ROUTE_FALLBACK_TYPES.SCHEDULE);
		expect(getRouteFallbackType("/coupons")).toBe(ROUTE_FALLBACK_TYPES.COUPONS);
		expect(getRouteFallbackType("/careers")).toBe(ROUTE_FALLBACK_TYPES.CAREERS);
		expect(getRouteFallbackType("/resources")).toBe(ROUTE_FALLBACK_TYPES.RESOURCES);
		expect(getRouteFallbackType("/faqs")).toBe(ROUTE_FALLBACK_TYPES.FAQS);
		expect(getRouteFallbackType("/financing")).toBe(ROUTE_FALLBACK_TYPES.FINANCING);
		expect(getRouteFallbackType("/warranty")).toBe(ROUTE_FALLBACK_TYPES.WARRANTY);
		expect(getRouteFallbackType("/reviews")).toBe(ROUTE_FALLBACK_TYPES.REVIEWS);
	});

	it("maps service area and service routes to granular fallbacks", () => {
		expect(getRouteFallbackType("/services")).toBe(ROUTE_FALLBACK_TYPES.SERVICE_CATEGORIES);
		expect(getRouteFallbackType("/services/drains")).toBe(ROUTE_FALLBACK_TYPES.SERVICE_CATEGORY);
		expect(getRouteFallbackType("/services/drains/hydro-jetting")).toBe(
			ROUTE_FALLBACK_TYPES.SERVICE
		);
		expect(getRouteFallbackType("/service-areas")).toBe(ROUTE_FALLBACK_TYPES.SERVICE_AREAS);
		expect(getRouteFallbackType("/service-areas/seattle")).toBe(ROUTE_FALLBACK_TYPES.REGION);
		expect(getRouteFallbackType("/service-areas/seattle/ballard")).toBe(
			ROUTE_FALLBACK_TYPES.AREA
		);
	});

	it("falls back to the default loader for other pages", () => {
		expect(getRouteFallbackType("/some-random-path")).toBe(ROUTE_FALLBACK_TYPES.DEFAULT);
		expect(getRouteFallbackType("/404")).toBe(ROUTE_FALLBACK_TYPES.NOT_FOUND);
		expect(getRouteFallbackType("")).toBe(ROUTE_FALLBACK_TYPES.HOME);
	});
});