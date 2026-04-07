import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import Seo from "./Seo";
import { CompanyInfo } from "../../data/data";
import { getRouteSeo } from "./routeSeoConfig";

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
			image: "https://hyxqrhttputdkefadnrf.supabase.co/storage/v1/object/public/assets/logo/pspah-logo-340.webp",
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
