import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientRoot = path.resolve(__dirname, "..");
const publicDir = path.join(clientRoot, "public");
const appFile = path.join(clientRoot, "src", "App.jsx");
const dataFile = path.join(clientRoot, "src", "data", "data.jsx");
const sitemapFile = path.join(publicDir, "sitemap.xml");
const baseUrl = "https://www.pugetsoundplumbing.com";

function normalizePath(routePath) {
	if (!routePath || routePath === "/") {
		return "/";
	}

	return routePath.endsWith("/") ? routePath.slice(0, -1) : routePath;
}

function buildUrl(routePath) {
	const normalizedPath = normalizePath(routePath);
	return normalizedPath === "/" ? `${baseUrl}/` : `${baseUrl}${normalizedPath}`;
}

function xmlEscape(value) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
}

function getPriority(routePath) {
	if (routePath === "/") return "1.0";
	if (routePath === "/blog" || routePath === "/services" || routePath === "/service-areas") {
		return "0.8";
	}
	if (routePath.startsWith("/blog/")) return "0.7";
	if (routePath.startsWith("/services/") || routePath.startsWith("/service-areas/")) {
		return "0.7";
	}
	return "0.6";
}

function getChangefreq(routePath) {
	if (routePath === "/" || routePath === "/blog") return "weekly";
	return "monthly";
}

async function readUtf8(filePath) {
	return readFile(filePath, "utf8");
}

async function tryReadUtf8(filePath) {
	try {
		return await readUtf8(filePath);
	} catch {
		return null;
	}
}

async function loadStaticRoutes() {
	const appSource = await readUtf8(appFile);
	const routeMatches = [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)];
	return routeMatches
		.map((match) => match[1])
		.filter((routePath) => !routePath.includes(":") && !routePath.includes("*"))
		.map(normalizePath);
}

async function loadDataRoutes() {
	const dataSource = await readUtf8(dataFile);
	const hrefMatches = [...dataSource.matchAll(/href:\s*"([^"]+)"/g)];
	return hrefMatches
		.map((match) => normalizePath(match[1]))
		.filter((routePath) => routePath.startsWith("/services/") || routePath.startsWith("/service-areas/"));
}

function toIsoDate(dateValue) {
	if (!dateValue) return null;
	const parsed = new Date(dateValue);
	if (Number.isNaN(parsed.getTime())) return null;
	return parsed.toISOString().slice(0, 10);
}

async function loadBlogEntriesFromJson() {
	const candidatePaths = [
		path.join(clientRoot, "blog_posts.json"),
		path.resolve(clientRoot, "..", "blog_posts.json"),
	];

	for (const candidatePath of candidatePaths) {
		const content = await tryReadUtf8(candidatePath);
		if (!content) continue;

		try {
			const posts = JSON.parse(content);
			if (!Array.isArray(posts)) continue;

			return posts
				.map((post) => ({
					path: normalizePath(post.link || `/blog/${post.slug || ""}`),
					lastmod: toIsoDate(post.date),
				}))
				.filter((post) => post.path.startsWith("/blog/") && post.path !== "/blog/");
		} catch {
			// Ignore malformed fallback data and continue searching.
		}
	}

	return [];
}

async function loadBlogEntriesFromExistingSitemap() {
	const existingSitemap = await tryReadUtf8(sitemapFile);
	if (!existingSitemap) return [];

	const urlBlocks = [...existingSitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)];
	return urlBlocks
		.map((match) => {
			const block = match[1];
			const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1] || "";
			const lastmod = block.match(/<lastmod>(.*?)<\/lastmod>/)?.[1] || null;
			return {
				path: normalizePath(loc.replace(baseUrl, "")),
				lastmod,
			};
		})
		.filter((entry) => entry.path.startsWith("/blog/"));
}

function buildXmlEntries(entries) {
	return entries
		.map((entry) => {
			const lines = [
				"  <url>",
				`    <loc>${xmlEscape(buildUrl(entry.path))}</loc>`,
			];

			if (entry.lastmod) {
				lines.push(`    <lastmod>${xmlEscape(entry.lastmod)}</lastmod>`);
			}

			lines.push(`    <changefreq>${getChangefreq(entry.path)}</changefreq>`);
			lines.push(`    <priority>${getPriority(entry.path)}</priority>`);
			lines.push("  </url>");
			return lines.join("\n");
		})
		.join("\n");
}

async function main() {
	const [staticRoutes, dataRoutes, jsonBlogEntries, sitemapBlogEntries] = await Promise.all([
		loadStaticRoutes(),
		loadDataRoutes(),
		loadBlogEntriesFromJson(),
		loadBlogEntriesFromExistingSitemap(),
	]);

	const routeEntries = [...staticRoutes, ...dataRoutes].map((routePath) => ({
		path: routePath,
		lastmod: null,
	}));

	const blogEntries = jsonBlogEntries.length > 0 ? jsonBlogEntries : sitemapBlogEntries;
	const uniqueEntries = [];
	const seenPaths = new Set();

	for (const entry of [...routeEntries, ...blogEntries]) {
		const normalizedPath = normalizePath(entry.path);
		if (!normalizedPath || seenPaths.has(normalizedPath)) continue;
		seenPaths.add(normalizedPath);
		uniqueEntries.push({
			path: normalizedPath,
			lastmod: entry.lastmod || null,
		});
	}

	const sitemapXml = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		buildXmlEntries(uniqueEntries),
		'</urlset>',
	].join("\n");

	await writeFile(sitemapFile, `${sitemapXml}\n`, "utf8");
	console.log(`Generated sitemap with ${uniqueEntries.length} URLs at ${sitemapFile}`);
}

main().catch((error) => {
	console.error("Failed to generate sitemap.");
	console.error(error);
	process.exitCode = 1;
});