export const SITE_NAME = "Puget Sound Plumbing and Heating";
export const DEFAULT_IMAGE = "https://d1fyhmg0o2pfye.cloudfront.net/public/pspah-logo-340.webp";

export const DEFAULT_SEO = {
	title: "Seattle Plumbing, Drain, Sewer, and Water Heater Experts",
	description:
		"Puget Sound Plumbing and Heating provides trusted plumbing, drain, sewer, and water heater services across the Seattle area. Call for fast, professional service.",
};

export const STATIC_ROUTE_SEO = {
	"/": {
		title: "Seattle Plumbing, Drain, Sewer, and Water Heater Experts",
		description:
			"Need reliable plumbing in the Seattle area? Puget Sound Plumbing and Heating offers drain cleaning, water heater service, sewer solutions, and emergency plumbing.",
	},
	"/schedule-online": {
		title: "Schedule Plumbing Service Online",
		description:
			"Book your plumbing service online with Puget Sound Plumbing and Heating. Fast scheduling for plumbing repairs, drains, sewer, and water heater service.",
	},
	"/services": {
		title: "Plumbing Services",
		description:
			"Explore plumbing services including repairs, drains, sewer, gas lines, leak detection, and water heater solutions across the Seattle metro area.",
	},
	"/service-areas": {
		title: "Plumbing Service Areas",
		description:
			"See the cities and neighborhoods served by Puget Sound Plumbing and Heating throughout the Seattle and Puget Sound region.",
	},
	"/blog": {
		title: "Plumbing Tips and Advice Blog",
		description:
			"Read expert plumbing tips, maintenance advice, and home plumbing education from Puget Sound Plumbing and Heating.",
	},
	"/faqs": {
		title: "Plumbing FAQs",
		description:
			"Find answers to common plumbing, drain, sewer, and water heater questions from Puget Sound Plumbing and Heating.",
	},
	"/reviews": {
		title: "Customer Reviews",
		description:
			"Read verified customer feedback and reviews for Puget Sound Plumbing and Heating from homeowners in the Seattle area.",
	},
	"/about-us": {
		title: "About Puget Sound Plumbing and Heating",
		description:
			"Learn about Puget Sound Plumbing and Heating, our team, values, and commitment to quality plumbing service in the Seattle area.",
	},
	"/coupons": {
		title: "Plumbing Coupons and Special Offers",
		description:
			"Save with current plumbing coupons and limited-time service specials from Puget Sound Plumbing and Heating.",
	},
	"/resources": {
		title: "Homeowner Plumbing Resources",
		description:
			"Explore homeowner resources, maintenance guidance, and practical plumbing information from Puget Sound Plumbing and Heating.",
	},
	"/financing": {
		title: "Plumbing Financing Options",
		description:
			"Review financing options for plumbing and home comfort projects from Puget Sound Plumbing and Heating.",
	},
	"/warranty": {
		title: "Service and Workmanship Warranty",
		description:
			"Learn about service coverage and workmanship warranty details offered by Puget Sound Plumbing and Heating.",
	},
	"/careers": {
		title: "Plumbing Careers",
		description:
			"Explore career opportunities with Puget Sound Plumbing and Heating in the Seattle area.",
	},
};

export function normalizeRoutePath(pathname) {
	if (!pathname || pathname === "/") return "/";
	return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function titleizeSlug(slug) {
	return String(slug || "")
		.split("-")
		.filter(Boolean)
		.map((part) => {
			const lower = part.toLowerCase();
			if (lower === "ac") return "AC";
			if (lower === "hvac") return "HVAC";
			if (lower === "faq" || lower === "faqs") return "FAQs";
			return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
		})
		.join(" ");
}

export function getRouteSeo(pathname) {
	const normalizedPath = normalizeRoutePath(pathname);
	if (STATIC_ROUTE_SEO[normalizedPath]) return STATIC_ROUTE_SEO[normalizedPath];

	if (normalizedPath.startsWith("/services/")) {
		const segments = normalizedPath.split("/").filter(Boolean);
		const categoryName = titleizeSlug(segments[1]);
		const serviceName = titleizeSlug(segments[2]);

		if (serviceName) {
			return {
				title: `${serviceName} in Seattle Area`,
				description: `Professional ${serviceName.toLowerCase()} services from Puget Sound Plumbing and Heating for homeowners across the Seattle area.`,
			};
		}

		return {
			title: `${categoryName} Plumbing Services`,
			description: `Explore ${categoryName.toLowerCase()} services from Puget Sound Plumbing and Heating, including repairs, installations, and emergency support across the Seattle area.`,
		};
	}

	if (normalizedPath.startsWith("/service-areas/")) {
		const segments = normalizedPath.split("/").filter(Boolean);
		const regionName = titleizeSlug(segments[1]);
		const areaName = titleizeSlug(segments[2]);

		if (areaName) {
			return {
				title: `Plumbers in ${areaName}, ${regionName}`,
				description: `Need plumbing help in ${areaName}? Puget Sound Plumbing and Heating provides repairs, drain and sewer service, and water heater solutions.`,
			};
		}

		return {
			title: `Plumbers in ${regionName}`,
			description: `Licensed local plumbers serving ${regionName} with drain, sewer, water heater, and emergency plumbing services.`,
		};
	}

	if (normalizedPath.startsWith("/blog/")) {
		const articleTitle = titleizeSlug(normalizedPath.split("/").filter(Boolean)[1]);
		return {
			title: articleTitle || "Plumbing Blog Article",
			description:
				"Read plumbing guidance from Puget Sound Plumbing and Heating, including homeowner tips and maintenance best practices.",
		};
	}

	return DEFAULT_SEO;
}