export const ROUTE_FALLBACK_TYPES = {
	MINIMAL: "minimal-shell",
	NOT_FOUND: "not-found-shell",
};

const KNOWN_ROUTE_PATTERNS = [
	/^\/$/,
	/^\/about-us$/,
	/^\/blog$/,
	/^\/blog\/[^/]+$/,
	/^\/schedule-online$/,
	/^\/coupons$/,
	/^\/careers$/,
	/^\/resources$/,
	/^\/faqs$/,
	/^\/financing$/,
	/^\/warranty$/,
	/^\/reviews$/,
	/^\/service-areas$/,
	/^\/service-areas\/[^/]+$/,
	/^\/service-areas\/[^/]+\/[^/]+$/,
	/^\/services$/,
	/^\/services\/[^/]+$/,
	/^\/services\/[^/]+\/[^/]+$/,
];

function normalizePath(pathname = "/") {
	const [pathOnly = "/"] = (pathname || "/").split(/[?#]/);

	if (!pathOnly || pathOnly === "/") {
		return "/";
	}

	return pathOnly.replace(/\/+$/, "") || "/";
}

function isKnownRoute(pathname) {
	return KNOWN_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}

export function getRouteFallbackType(pathname = "/") {
	const normalizedPath = normalizePath(pathname);

	if (normalizedPath === "/404") {
		return ROUTE_FALLBACK_TYPES.NOT_FOUND;
	}

	return isKnownRoute(normalizedPath)
		? ROUTE_FALLBACK_TYPES.MINIMAL
		: ROUTE_FALLBACK_TYPES.NOT_FOUND;
}

export function getRouteFallbackPolicy(pathname = "/") {
	const type = getRouteFallbackType(pathname);

	if (type === ROUTE_FALLBACK_TYPES.NOT_FOUND) {
		return {
			type,
			loadingLabel: "Loading page",
			announcement: "Loading page content.",
		};
	}

	return {
		type,
		loadingLabel: "Loading content",
		announcement: "Loading page content.",
	};
}