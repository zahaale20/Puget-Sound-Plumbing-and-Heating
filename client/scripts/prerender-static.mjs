import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	DEFAULT_IMAGE,
	SITE_NAME,
	getRouteSeo,
	normalizeRoutePath,
	titleizeSlug,
} from "../src/components/seo/routeSeoConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientRoot = path.resolve(__dirname, "..");
const distDir = path.join(clientRoot, "dist");
const distIndexFile = path.join(distDir, "index.html");
const distSitemapFile = path.join(distDir, "sitemap.xml");
const siteUrl = (process.env.VITE_SITE_URL || "https://www.pugetsoundplumbing.com").replace(/\/$/, "");

function escapeHtml(value) {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function absoluteUrl(routePath) {
	return routePath === "/" ? `${siteUrl}/` : `${siteUrl}${routePath}`;
}

function buildBreadcrumbJsonLd(routePath, title) {
	const segments = routePath.split("/").filter(Boolean);
	const items = [{ name: "Home", item: `${siteUrl}/` }];
	let currentPath = "";

	for (const segment of segments) {
		currentPath += `/${segment}`;
		items.push({
			name: titleizeSlug(segment),
			item: absoluteUrl(currentPath),
		});
	}

	if (items.length > 0) {
		items[items.length - 1].name = title;
	}

	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: item.item,
		})),
	};
}

function buildLocalBusinessJsonLd() {
	return {
		"@context": "https://schema.org",
		"@type": "Plumber",
		name: SITE_NAME,
		url: siteUrl,
		telephone: "+1-206-938-3219",
		image: DEFAULT_IMAGE,
		priceRange: "$$",
		address: {
			"@type": "PostalAddress",
			streetAddress: "11803 Des Moines Memorial Dr S",
			addressLocality: "Burien",
			addressRegion: "WA",
			postalCode: "98168",
			addressCountry: "US",
		},
		areaServed: "Seattle metropolitan area",
	};
}

function buildWebPageJsonLd(metadata, routePath) {
	return {
		"@context": "https://schema.org",
		"@type": metadata.type === "article" ? "Article" : "WebPage",
		name: metadata.title,
		description: metadata.description,
		url: absoluteUrl(routePath),
		image: metadata.image,
	};
}

function buildHeadMarkup(metadata, routePath) {
	const titleTag = `${metadata.title} | ${SITE_NAME}`;
	const jsonLdBlocks = [
		buildLocalBusinessJsonLd(),
		buildWebPageJsonLd(metadata, routePath),
		buildBreadcrumbJsonLd(routePath, metadata.title),
	];

	if (metadata.articleJsonLd) {
		jsonLdBlocks.unshift(metadata.articleJsonLd);
	}

	return [
		`<title>${escapeHtml(titleTag)}</title>`,
		`<meta name="description" content="${escapeHtml(metadata.description)}" />`,
		`<link rel="canonical" href="${escapeHtml(absoluteUrl(routePath))}" />`,
		`<meta name="robots" content="${metadata.noIndex ? "noindex, nofollow" : "index, follow"}" />`,
		'<meta property="og:locale" content="en_US" />',
		`<meta property="og:type" content="${escapeHtml(metadata.type)}" />`,
		`<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
		`<meta property="og:title" content="${escapeHtml(titleTag)}" />`,
		`<meta property="og:description" content="${escapeHtml(metadata.description)}" />`,
		`<meta property="og:url" content="${escapeHtml(absoluteUrl(routePath))}" />`,
		`<meta property="og:image" content="${escapeHtml(metadata.image)}" />`,
		`<meta property="og:image:alt" content="${escapeHtml(metadata.imageAlt)}" />`,
		'<meta name="twitter:card" content="summary_large_image" />',
		'<meta name="twitter:site" content="@PugetPlumbing" />',
		`<meta name="twitter:title" content="${escapeHtml(titleTag)}" />`,
		`<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`,
		`<meta name="twitter:image" content="${escapeHtml(metadata.image)}" />`,
		`<meta name="twitter:image:alt" content="${escapeHtml(metadata.imageAlt)}" />`,
		...jsonLdBlocks.map(
			(schema) =>
				`<script type="application/ld+json">${JSON.stringify(schema)}</script>`
		),
	].join("\n\t\t");
}

function stripManagedHeadTags(html) {
	return html
		.replace(/\s*<title>[\s\S]*?<\/title>/gi, "")
		.replace(/\s*<meta[^>]+name="description"[^>]*>/gi, "")
		.replace(/\s*<meta[^>]+name="robots"[^>]*>/gi, "")
		.replace(/\s*<meta[^>]+name="twitter:[^"]+"[^>]*>/gi, "")
		.replace(/\s*<meta[^>]+property="og:[^"]+"[^>]*>/gi, "")
		.replace(/\s*<link[^>]+rel="canonical"[^>]*>/gi, "")
		.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");
}

function injectSeoHead(html, metadata, routePath) {
	const sanitizedHtml = stripManagedHeadTags(html);
	return sanitizedHtml.replace("</head>", `\t\t${buildHeadMarkup(metadata, routePath)}\n\t</head>`);
}

function updateNoscriptContent(html, metadata) {
	const noscriptMarkup = [
		"<noscript>",
			`<h1>${escapeHtml(metadata.title)}</h1>`,
			`<p>${escapeHtml(metadata.description)}</p>`,
		"</noscript>",
	].join("\n\t\t");

	return html.replace(
		/(<div id="root"><\/div>\s*)(<noscript>[\s\S]*?<\/noscript>)/i,
		(_, rootMarkup) => `${rootMarkup}${noscriptMarkup}`
	);
}

async function loadSitemapRoutes() {
	const sitemapXml = await readFile(distSitemapFile, "utf8");
	const matches = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)];
	return matches
		.map((match) => match[1])
		.filter((loc) => loc.startsWith(siteUrl))
		.map((loc) => normalizeRoutePath(loc.replace(siteUrl, "") || "/"));
}

async function loadBlogIndex() {
	const candidatePaths = [
		path.resolve(clientRoot, "..", "blog_posts.json"),
		path.join(clientRoot, "blog_posts.json"),
	];

	for (const candidatePath of candidatePaths) {
		try {
			const content = await readFile(candidatePath, "utf8");
			const posts = JSON.parse(content);
			if (!Array.isArray(posts)) continue;

			return new Map(
				posts
					.filter((post) => post?.slug)
					.map((post) => [
						normalizeRoutePath(post.link || `/blog/${post.slug}`),
						post,
					])
			);
		} catch {
			// Try the next location.
		}
	}

	return new Map();
}

function getRouteMetadata(routePath, blogIndex) {
	const blogPost = blogIndex.get(routePath);
	if (blogPost) {
		const articleJsonLd = {
			"@context": "https://schema.org",
			"@type": "BlogPosting",
			headline: blogPost.title,
			description: blogPost.description,
			datePublished: blogPost.date || undefined,
			author: {
				"@type": "Person",
				name: blogPost.author || SITE_NAME,
			},
			publisher: {
				"@type": "Organization",
				name: SITE_NAME,
				logo: {
					"@type": "ImageObject",
					url: DEFAULT_IMAGE,
				},
			},
			mainEntityOfPage: absoluteUrl(routePath),
			image: blogPost.featured_image_url || DEFAULT_IMAGE,
		};

		return {
			title: blogPost.title,
			description: blogPost.description || getRouteSeo(routePath).description,
			image: blogPost.featured_image_url || DEFAULT_IMAGE,
			imageAlt: blogPost.title,
			type: "article",
			articleJsonLd,
		};
	}

	const routeSeo = getRouteSeo(routePath);
	return {
		...routeSeo,
		image: DEFAULT_IMAGE,
		imageAlt: `${routeSeo.title} preview image`,
		type: "website",
		noIndex: routePath === "/404",
	};
}

async function writeRouteHtml(routePath, templateHtml, metadata) {
	const htmlWithHead = injectSeoHead(templateHtml, metadata, routePath);
	const finalHtml = updateNoscriptContent(htmlWithHead, metadata);

	if (routePath === "/") {
		await writeFile(distIndexFile, finalHtml, "utf8");
		return;
	}

	const targetDir = path.join(distDir, routePath.slice(1));
	await mkdir(targetDir, { recursive: true });
	await writeFile(path.join(targetDir, "index.html"), finalHtml, "utf8");
}

async function main() {
	const [templateHtml, routes, blogIndex] = await Promise.all([
		readFile(distIndexFile, "utf8"),
		loadSitemapRoutes(),
		loadBlogIndex(),
	]);

	const uniqueRoutes = [...new Set(routes)].filter(Boolean);
	for (const routePath of uniqueRoutes) {
		const metadata = getRouteMetadata(routePath, blogIndex);
		await writeRouteHtml(routePath, templateHtml, metadata);
	}

	console.log(`Prerendered SEO snapshots for ${uniqueRoutes.length} routes.`);
}

main().catch((error) => {
	console.error("Failed to prerender SEO snapshots.");
	console.error(error);
	process.exitCode = 1;
});