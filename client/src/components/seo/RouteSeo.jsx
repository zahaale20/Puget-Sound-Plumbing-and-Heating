import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import Seo from "./Seo";
import { CompanyInfo } from "../../data/data";

const DEFAULT_SEO = {
	title: "Seattle Plumbing, Drain, Sewer, and Water Heater Experts",
	description:
		"Puget Sound Plumbing and Heating provides trusted plumbing, drain, sewer, and water heater services across the Seattle area. Call for fast, professional service.",
};

const ROUTE_SEO = {
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

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://www.pugetsoundplumbing.com").replace(/\/$/, "");

function getRouteSeo(pathname) {
	if (ROUTE_SEO[pathname]) return ROUTE_SEO[pathname];
	if (pathname.startsWith("/services/")) {
		return {
			title: "Professional Plumbing Service",
			description:
				"Get expert plumbing services from Puget Sound Plumbing and Heating. We deliver dependable solutions across the Seattle area.",
		};
	}
	if (pathname.startsWith("/service-areas/")) {
		return {
			title: "Local Plumbing Service Area",
			description:
				"Find local plumbing support from Puget Sound Plumbing and Heating in your neighborhood and surrounding communities.",
		};
	}
	if (pathname.startsWith("/blog/")) {
		return {
			title: "Plumbing Blog Article",
			description:
				"Read plumbing guidance from Puget Sound Plumbing and Heating, including homeowner tips and maintenance best practices.",
		};
	}
	return DEFAULT_SEO;
}

export default function RouteSeo() {
	const { pathname } = useLocation();
	const seo = getRouteSeo(pathname);

	const localBusinessJsonLd = useMemo(
		() => ({
			"@context": "https://schema.org",
			"@type": "Plumber",
			name: "Puget Sound Plumbing and Heating",
			url: SITE_URL,
			telephone: CompanyInfo.phoneTel.replace("tel:", ""),
			image: "https://d1fyhmg0o2pfye.cloudfront.net/public/pspah-logo.png",
			address: {
				"@type": "PostalAddress",
				streetAddress: CompanyInfo.address,
				addressLocality: "Burien",
				addressRegion: "WA",
				postalCode: "98168",
				addressCountry: "US",
			},
			areaServed: "Seattle metropolitan area",
			priceRange: "$$",
		}),
		[]
	);

	return <Seo title={seo.title} description={seo.description} path={pathname} jsonLd={localBusinessJsonLd} />;
}
