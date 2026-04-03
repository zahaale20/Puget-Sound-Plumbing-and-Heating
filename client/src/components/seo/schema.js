const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://www.pugetsoundplumbing.com").replace(/\/$/, "");

export function buildBreadcrumbJsonLd(items) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: `${SITE_URL}${item.path}`,
		})),
	};
}
