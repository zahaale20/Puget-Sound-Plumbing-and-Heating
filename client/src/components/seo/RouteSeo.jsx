import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import Seo from "./Seo";
import { CompanyInfo } from "../../data/data";
import { getRouteSeo } from "./routeSeoConfig";
import { getImageUrl } from "../../services/imageService";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://www.pugetsoundplumbing.com").replace(/\/$/, "");

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
			image: getImageUrl("logo/pspah-logo.webp") || `${SITE_URL}/logomark.png`,
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
