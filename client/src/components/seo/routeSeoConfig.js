export const SITE_NAME = "Puget Sound Plumbing and Heating";
export const DEFAULT_IMAGE = "https://d1fyhmg0o2pfye.cloudfront.net/public/pspah-logo-340.webp";

const SERVICE_AREA = "Seattle area";
const DEFAULT_TITLE = "Seattle Plumbing, Drain, Sewer, and Water Heater Experts";
const SERVICE_AREA_TITLE = "Seattle Area";
const SEATTLE_METRO_AREA = "Seattle metro area";
const PUGET_SOUND_REGION = "Seattle and Puget Sound region";

export const DEFAULT_SEO = {
	title: DEFAULT_TITLE,
	description:
		`${SITE_NAME} provides trusted plumbing, drain, sewer, and water heater services across the ${SERVICE_AREA}. Call for fast, professional service.`,
};

export const STATIC_ROUTE_SEO = {
	"/": {
		title: DEFAULT_TITLE,
		description:
			`Need reliable plumbing in the ${SERVICE_AREA}? ${SITE_NAME} offers drain cleaning, water heater service, sewer solutions, and emergency plumbing.`,
	},
	"/schedule-online": {
		title: "Schedule Plumbing Service Online",
		description:
			`Book your plumbing service online with ${SITE_NAME}. Fast scheduling for plumbing repairs, drains, sewer, and water heater service.`,
	},
	"/services": {
		title: "Plumbing Services",
		description:
			`Explore plumbing services including repairs, drains, sewer, gas lines, leak detection, and water heater solutions across the ${SEATTLE_METRO_AREA}.`,
	},
	"/service-areas": {
		title: "Plumbing Service Areas",
		description:
			`See the cities and neighborhoods served by ${SITE_NAME} throughout the ${PUGET_SOUND_REGION}.`,
	},
	"/blog": {
		title: "Plumbing Tips and Advice Blog",
		description:
			`Read expert plumbing tips, maintenance advice, and home plumbing education from ${SITE_NAME}.`,
	},
	"/faqs": {
		title: "Plumbing FAQs",
		description:
			`Find answers to common plumbing, drain, sewer, and water heater questions from ${SITE_NAME}.`,
	},
	"/reviews": {
		title: "Customer Reviews",
		description:
			`Read verified customer feedback and reviews for ${SITE_NAME} from homeowners in the ${SERVICE_AREA}.`,
	},
	"/about-us": {
		title: `About ${SITE_NAME}`,
		description:
			`Learn about ${SITE_NAME}, our team, values, and commitment to quality plumbing service in the ${SERVICE_AREA}.`,
	},
	"/coupons": {
		title: "Plumbing Coupons and Special Offers",
		description:
			`Save with current plumbing coupons and limited-time service specials from ${SITE_NAME}.`,
	},
	"/resources": {
		title: "Homeowner Plumbing Resources",
		description:
			`Explore homeowner resources, maintenance guidance, and practical plumbing information from ${SITE_NAME}.`,
	},
	"/financing": {
		title: "Plumbing Financing Options",
		description:
			`Review financing options for plumbing and home comfort projects from ${SITE_NAME}.`,
	},
	"/warranty": {
		title: "Service and Workmanship Warranty",
		description:
			`Learn about service coverage and workmanship warranty details offered by ${SITE_NAME}.`,
	},
	"/careers": {
		title: "Plumbing Careers",
		description:
			`Explore career opportunities with ${SITE_NAME} in the ${SERVICE_AREA}.`,
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
				title: `${serviceName} in ${SERVICE_AREA_TITLE}`,
				description: `Professional ${serviceName.toLowerCase()} services from ${SITE_NAME} for homeowners across the ${SERVICE_AREA}.`,
			};
		}

		return {
			title: `${categoryName} Plumbing Services`,
			description: `Explore ${categoryName.toLowerCase()} services from ${SITE_NAME}, including repairs, installations, and emergency support across the ${SERVICE_AREA}.`,
		};
	}

	if (normalizedPath.startsWith("/service-areas/")) {
		const segments = normalizedPath.split("/").filter(Boolean);
		const regionName = titleizeSlug(segments[1]);
		const areaName = titleizeSlug(segments[2]);

		if (areaName) {
			return {
				title: `Plumbers in ${areaName}, ${regionName}`,
				description: `Need plumbing help in ${areaName}? ${SITE_NAME} provides repairs, drain and sewer service, and water heater solutions.`,
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
				`Read plumbing guidance from ${SITE_NAME}, including homeowner tips and maintenance best practices.`,
		};
	}

	return DEFAULT_SEO;
}