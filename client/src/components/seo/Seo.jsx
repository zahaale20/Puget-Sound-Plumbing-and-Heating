import { Helmet } from "react-helmet-async";
import { DEFAULT_IMAGE, SITE_NAME } from "./routeSeoConfig";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://www.pugetsoundplumbing.com").replace(/\/$/, "");

export default function Seo({
	title,
	description,
	path = "/",
	image,
	type = "website",
	jsonLd,
	noIndex = false,
}) {
	const canonicalUrl = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
	const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
	const socialImage = image || DEFAULT_IMAGE;
	const socialImageAlt = `${title || SITE_NAME} preview image`;
	const jsonLdBlocks = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

	return (
		<Helmet>
			<title>{pageTitle}</title>
			<meta name="description" content={description} />
			<link rel="canonical" href={canonicalUrl} />
			<meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
			<meta property="og:locale" content="en_US" />

			<meta property="og:type" content={type} />
			<meta property="og:site_name" content={SITE_NAME} />
			<meta property="og:title" content={pageTitle} />
			<meta property="og:description" content={description} />
			<meta property="og:url" content={canonicalUrl} />
			<meta property="og:image" content={socialImage} />
			<meta property="og:image:alt" content={socialImageAlt} />

			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:site" content="@PugetPlumbing" />
			<meta name="twitter:title" content={pageTitle} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={socialImage} />
			<meta name="twitter:image:alt" content={socialImageAlt} />

			{jsonLdBlocks.map((schema, index) => (
				<script key={`jsonld-${index}`} type="application/ld+json">
					{JSON.stringify(schema)}
				</script>
			))}
		</Helmet>
	);
}
