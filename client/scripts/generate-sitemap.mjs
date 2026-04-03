import fs from "node:fs";
import path from "node:path";

const SITE_URL = "https://www.pugetsoundplumbing.com";
const ROOT_DIR = process.cwd();
const dataFilePath = path.join(ROOT_DIR, "src", "data", "data.jsx");
const sitemapPath = path.join(ROOT_DIR, "public", "sitemap.xml");
const rootBlogPostsPath = path.join(ROOT_DIR, "..", "..", "blog_posts.json");
const rootBlogPostUrlsPath = path.join(ROOT_DIR, "..", "..", "blog_post_urls.json");

const staticRoutes = [
	"/",
	"/schedule-online",
	"/services",
	"/service-areas",
	"/blog",
	"/faqs",
	"/reviews",
	"/about-us",
	"/coupons",
	"/resources",
	"/financing",
	"/warranty",
	"/careers",
];

function routePriority(route) {
	if (route === "/") return "1.0";
	if (route.startsWith("/blog/")) return "0.7";
	if (route.startsWith("/services/") && route.split("/").length > 3) return "0.9";
	if (route.startsWith("/services/")) return "0.85";
	if (route.startsWith("/service-areas/") && route.split("/").length > 3) return "0.8";
	if (route.startsWith("/service-areas/")) return "0.75";
	if (["/services", "/service-areas", "/schedule-online"].includes(route)) return "0.9";
	if (route === "/blog") return "0.8";
	return "0.6";
}

function routeChangeFreq(route) {
	if (route === "/" || route === "/blog") return "weekly";
	if (route.startsWith("/blog/")) return "monthly";
	if (route.startsWith("/services") || route.startsWith("/service-areas")) return "monthly";
	if (route === "/schedule-online" || route === "/coupons") return "weekly";
	return "monthly";
}

function normalizeRoute(route) {
	if (!route || typeof route !== "string") return null;
	if (!route.startsWith("/")) return null;
	return route.endsWith("/") && route !== "/" ? route.slice(0, -1) : route;
}

function extractPathFromAbsoluteUrl(value) {
	try {
		const parsed = new URL(value);
		if (parsed.hostname !== "pugetsoundplumbing.com" && parsed.hostname !== "www.pugetsoundplumbing.com") {
			return null;
		}
		return normalizeRoute(parsed.pathname);
	} catch {
		return null;
	}
}

function normalizeIsoDate(value) {
	if (!value) return null;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;
	return date.toISOString().slice(0, 10);
}

function parseRoutesFromDataFile(contents) {
	const hrefRegex = /href:\s*"(\/[^"#?]*)"/g;
	const routes = new Map();
	let match;

	while ((match = hrefRegex.exec(contents)) !== null) {
		const value = normalizeRoute(match[1].trim());
		if (value && !value.includes(":")) {
			routes.set(value, null);
		}
	}

	return routes;
}

function addBlogPostsFromJson(routeMap) {
	if (!fs.existsSync(rootBlogPostsPath)) {
		return;
	}

	const raw = fs.readFileSync(rootBlogPostsPath, "utf8");
	const posts = JSON.parse(raw);
	if (!Array.isArray(posts)) {
		return;
	}

	for (const post of posts) {
		const routeFromLink = normalizeRoute(post?.link);
		const routeFromSlug = post?.slug ? normalizeRoute(`/blog/${post.slug}`) : null;
		const route = routeFromLink || routeFromSlug;
		if (!route || !route.startsWith("/blog/")) continue;

		const lastmod = normalizeIsoDate(post?.date || post?.published_date);
		const existing = routeMap.get(route);
		if (!existing || (lastmod && lastmod > existing)) {
			routeMap.set(route, lastmod || existing || null);
		}
	}
}

function addBlogUrlsFromList(routeMap) {
	if (!fs.existsSync(rootBlogPostUrlsPath)) {
		return;
	}

	const raw = fs.readFileSync(rootBlogPostUrlsPath, "utf8");
	const urls = JSON.parse(raw);
	if (!Array.isArray(urls)) {
		return;
	}

	for (const item of urls) {
		const route = extractPathFromAbsoluteUrl(item);
		if (!route || !route.startsWith("/blog/")) continue;
		if (!routeMap.has(route)) {
			routeMap.set(route, null);
		}
	}
}

function buildSitemapXml(routeMap) {
	const urls = Array.from(routeMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
	const entries = urls
		.map(([route, lastmod]) => {
			const loc = `${SITE_URL}${route}`;
			const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "";
			return `  <url>\n    <loc>${loc}</loc>${lastmodTag}\n    <changefreq>${routeChangeFreq(route)}</changefreq>\n    <priority>${routePriority(route)}</priority>\n  </url>`;
		})
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

function main() {
	const dataContents = fs.readFileSync(dataFilePath, "utf8");
	const extractedRoutes = parseRoutesFromDataFile(dataContents);
	const routeMap = new Map(staticRoutes.map((route) => [route, null]));

	for (const [route] of extractedRoutes.entries()) {
		routeMap.set(route, null);
	}

	addBlogPostsFromJson(routeMap);
	addBlogUrlsFromList(routeMap);

	const sitemapXml = buildSitemapXml(routeMap);
	fs.writeFileSync(sitemapPath, sitemapXml, "utf8");

	console.log(`Generated sitemap with ${routeMap.size} URLs at ${sitemapPath}`);
}

main();
