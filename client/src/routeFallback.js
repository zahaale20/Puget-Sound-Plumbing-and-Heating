export const ROUTE_FALLBACK_TYPES = {
	HOME: "home",
	ABOUT: "about",
	BLOG_INDEX: "blog-index",
	BLOG_POST: "blog-post",
	SCHEDULE: "schedule",
	COUPONS: "coupons",
	CAREERS: "careers",
	RESOURCES: "resources",
	FAQS: "faqs",
	FINANCING: "financing",
	WARRANTY: "warranty",
	REVIEWS: "reviews",
	SERVICE_AREAS: "service-areas",
	REGION: "region",
	AREA: "area",
	SERVICE_CATEGORIES: "service-categories",
	SERVICE_CATEGORY: "service-category",
	SERVICE: "service",
	NOT_FOUND: "not-found",
	DEFAULT: "default",
};

const hasPathSegments = (normalizedPath = "") => normalizedPath.split("/").filter(Boolean);

export function getRouteFallbackType(pathname = "/") {
	const normalizedPath = pathname || "/";
	const pathSegments = hasPathSegments(normalizedPath);

	if (normalizedPath === "/") {
		return ROUTE_FALLBACK_TYPES.HOME;
	}

	if (normalizedPath === "/about-us") {
		return ROUTE_FALLBACK_TYPES.ABOUT;
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

	if (normalizedPath === "/careers") {
		return ROUTE_FALLBACK_TYPES.CAREERS;
	}

	if (normalizedPath === "/resources") {
		return ROUTE_FALLBACK_TYPES.RESOURCES;
	}

	if (normalizedPath === "/faqs") {
		return ROUTE_FALLBACK_TYPES.FAQS;
	}

	if (normalizedPath === "/financing") {
		return ROUTE_FALLBACK_TYPES.FINANCING;
	}

	if (normalizedPath === "/warranty") {
		return ROUTE_FALLBACK_TYPES.WARRANTY;
	}

	if (normalizedPath === "/reviews") {
		return ROUTE_FALLBACK_TYPES.REVIEWS;
	}

	if (normalizedPath === "/service-areas") {
		return ROUTE_FALLBACK_TYPES.SERVICE_AREAS;
	}

	if (normalizedPath.startsWith("/service-areas/")) {
		if (pathSegments.length >= 3) return ROUTE_FALLBACK_TYPES.AREA;
		return ROUTE_FALLBACK_TYPES.REGION;
	}

	if (normalizedPath === "/services") {
		return ROUTE_FALLBACK_TYPES.SERVICE_CATEGORIES;
	}

	if (normalizedPath.startsWith("/services/")) {
		if (pathSegments.length >= 3) return ROUTE_FALLBACK_TYPES.SERVICE;
		return ROUTE_FALLBACK_TYPES.SERVICE_CATEGORY;
	}

	if (normalizedPath === "/404") {
		return ROUTE_FALLBACK_TYPES.NOT_FOUND;
	}

	return ROUTE_FALLBACK_TYPES.DEFAULT;
}