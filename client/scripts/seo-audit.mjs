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

	const [indexHtml, robotsTxt] = await Promise.all([
		readFile(path.join(distDir, "index.html"), "utf8"),
		readFile(path.join(distDir, "robots.txt"), "utf8"),
	]);

	const warnings = [];
	if (!/<title>.+<\/title>/i.test(indexHtml)) {
		warnings.push("index.html does not contain a <title> tag.");
	}

	if (!/Sitemap:\s*https:\/\/www\.pugetsoundplumbing\.com\/sitemap\.xml/i.test(robotsTxt)) {
		warnings.push("robots.txt is missing the expected sitemap reference.");
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