import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientRoot = path.resolve(__dirname, "..");
const distDir = path.join(clientRoot, "dist");

async function ensureFileExists(filePath) {
	try {
		await access(filePath);
		return true;
	} catch {
		return false;
	}
}

async function main() {
	const requiredFiles = [
		path.join(distDir, "index.html"),
		path.join(distDir, "robots.txt"),
		path.join(distDir, "sitemap.xml"),
		path.join(distDir, "about-us", "index.html"),
		path.join(distDir, "blog", "index.html"),
		path.join(distDir, "services", "plumbing", "index.html"),
	];

	const missingFiles = [];
	for (const filePath of requiredFiles) {
		if (!(await ensureFileExists(filePath))) {
			missingFiles.push(filePath);
		}
	}

	if (missingFiles.length > 0) {
		console.error("SEO audit failed. Missing required build artifacts:");
		for (const filePath of missingFiles) {
			console.error(`- ${filePath}`);
		}
		process.exitCode = 1;
		return;
	}

	const [indexHtml, robotsTxt, sitemapXml, aboutUsHtml] = await Promise.all([
		readFile(path.join(distDir, "index.html"), "utf8"),
		readFile(path.join(distDir, "robots.txt"), "utf8"),
		readFile(path.join(distDir, "sitemap.xml"), "utf8"),
		readFile(path.join(distDir, "about-us", "index.html"), "utf8"),
	]);

	const warnings = [];
	const failures = [];
	if (!/<title>.+<\/title>/i.test(indexHtml)) {
		failures.push("index.html does not contain a <title> tag.");
	}

	if (!/rel="canonical"/i.test(indexHtml)) {
		failures.push("index.html is missing a canonical link tag.");
	}

	if (!/property="og:title"/i.test(aboutUsHtml)) {
		failures.push("Prerendered about-us page is missing Open Graph metadata.");
	}

	const firstBlogLoc = sitemapXml.match(/<loc>(https:\/\/www\.pugetsoundplumbing\.com\/blog\/[^<]+)<\/loc>/i)?.[1];
	if (firstBlogLoc) {
		const blogPath = firstBlogLoc.replace("https://www.pugetsoundplumbing.com/", "").replace(/\/$/, "");
		const blogFile = path.join(distDir, blogPath, "index.html");
		if (!(await ensureFileExists(blogFile))) {
			failures.push(`Expected prerendered blog snapshot is missing: ${blogFile}`);
		}
	}

	if (!/Sitemap:\s*https:\/\/www\.pugetsoundplumbing\.com\/sitemap\.xml/i.test(robotsTxt)) {
		warnings.push("robots.txt is missing the expected sitemap reference.");
	}

	if (failures.length > 0) {
		console.error("SEO audit failed:");
		for (const failure of failures) {
			console.error(`- ${failure}`);
		}
		process.exitCode = 1;
		return;
	}

	if (warnings.length > 0) {
		console.warn("SEO audit warnings:");
		for (const warning of warnings) {
			console.warn(`- ${warning}`);
		}
	} else {
		console.log("SEO audit passed.");
	}
}

main().catch((error) => {
	console.error("SEO audit failed.");
	console.error(error);
	process.exitCode = 1;
});