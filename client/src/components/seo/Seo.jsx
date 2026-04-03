import { Helmet } from "react-helmet-async";

const SITE_NAME = "Puget Sound Plumbing and Heating";
const DEFAULT_IMAGE = "https://d1fyhmg0o2pfye.cloudfront.net/public/pspah-logo.png";
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
	const jsonLdBlocks = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

	return (
		<Helmet>
			<title>{pageTitle}</title>
			<meta name="description" content={description} />
			<link rel="canonical" href={canonicalUrl} />
			<meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />

			<meta property="og:type" content={type} />
			<meta property="og:site_name" content={SITE_NAME} />
			<meta property="og:title" content={pageTitle} />
			<meta property="og:description" content={description} />
			<meta property="og:url" content={canonicalUrl} />
			<meta property="og:image" content={socialImage} />

			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={pageTitle} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={socialImage} />

			{jsonLdBlocks.map((schema, index) => (
				<script key={`jsonld-${index}`} type="application/ld+json">
					{JSON.stringify(schema)}
				</script>
			))}
		</Helmet>
	);
}
