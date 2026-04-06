export const ROUTE_FALLBACK_TYPES = {
	HOME: "home",
	BLOG_INDEX: "blog-index",
	BLOG_POST: "blog-post",
	SCHEDULE: "schedule",
	COUPONS: "coupons",
	SERVICE: "service",
	DEFAULT: "default",
};

const SERVICE_ROUTE_PREFIXES = ["/services", "/service-areas"];

export function getRouteFallbackType(pathname = "/") {
	const normalizedPath = pathname || "/";

	if (normalizedPath === "/") {
		return ROUTE_FALLBACK_TYPES.HOME;
	}

	if (normalizedPath === "/blog") {
		return ROUTE_FALLBACK_TYPES.BLOG_INDEX;
	}

	if (normalizedPath.startsWith("/blog/")) {
		return ROUTE_FALLBACK_TYPES.BLOG_POST;
	}

	if (normalizedPath === "/schedule-online") {
		return ROUTE_FALLBACK_TYPES.SCHEDULE;
	}

	if (normalizedPath === "/coupons") {
		return ROUTE_FALLBACK_TYPES.COUPONS;
	}

	if (
		SERVICE_ROUTE_PREFIXES.some(
			(prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
		)
	) {
		return ROUTE_FALLBACK_TYPES.SERVICE;
	}

	return ROUTE_FALLBACK_TYPES.DEFAULT;
}