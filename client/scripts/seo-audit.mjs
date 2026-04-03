import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
const pagesDir = path.join(ROOT_DIR, "src", "pages");
const requiredFiles = [
	path.join(ROOT_DIR, "public", "robots.txt"),
	path.join(ROOT_DIR, "public", "sitemap.xml"),
	path.join(ROOT_DIR, "src", "components", "seo", "Seo.jsx"),
];

const routedPages = [
	"HomePage.jsx",
	"ScheduleOnlinePage.jsx",
	"BlogPage.jsx",
	"BlogPostPage.jsx",
	"CareersPage.jsx",
	"LimitedTimeOffersPage.jsx",
	"ResourcesPage.jsx",
	"AboutUsPage.jsx",
	"FinancingPage.jsx",
	"WarrantyPage.jsx",
	"CustomerReviewsPage.jsx",
	"FAQsPage.jsx",
	"ServiceAreasPage.jsx",
	"RegionsPage.jsx",
	"AreaPage.jsx",
	"ServiceCategoriesPage.jsx",
	"ServiceCategoryPage.jsx",
	"ServicePage.jsx",
	"NotFoundPage.jsx",
];

const alternativeH1Patterns = {
	"HomePage.jsx": [/<Hero\b/],
};

function assertRequiredFiles() {
	const missing = requiredFiles.filter((filePath) => !fs.existsSync(filePath));
	if (missing.length > 0) {
		throw new Error(`Missing required SEO files:\n${missing.join("\n")}`);
	}
}

function assertH1Presence() {
	const missingH1 = [];

	for (const page of routedPages) {
		const filePath = path.join(pagesDir, page);
		if (!fs.existsSync(filePath)) {
			missingH1.push(`${page} (file missing)`);
			continue;
		}

		const contents = fs.readFileSync(filePath, "utf8");
		const hasDirectH1 = /<h1\b/i.test(contents);
		const hasAlternativeH1 = (alternativeH1Patterns[page] || []).some((pattern) =>
			pattern.test(contents)
		);

		if (!hasDirectH1 && !hasAlternativeH1) {
			missingH1.push(page);
		}
	}

	if (missingH1.length > 0) {
		throw new Error(`Pages missing <h1>:\n${missingH1.join("\n")}`);
	}
}

function assertSitemapContainsCoreRoutes() {
	const sitemapPath = path.join(ROOT_DIR, "public", "sitemap.xml");
	const sitemap = fs.readFileSync(sitemapPath, "utf8");
	const requiredRoutes = [
		"https://www.pugetsoundplumbing.com/",
		"https://www.pugetsoundplumbing.com/services",
		"https://www.pugetsoundplumbing.com/service-areas",
		"https://www.pugetsoundplumbing.com/blog",
		"https://www.pugetsoundplumbing.com/schedule-online",
	];

	const missing = requiredRoutes.filter((url) => !sitemap.includes(`<loc>${url}</loc>`));
	if (missing.length > 0) {
		throw new Error(`Sitemap is missing core URLs:\n${missing.join("\n")}`);
	}
}

function main() {
	assertRequiredFiles();
	assertH1Presence();
	assertSitemapContainsCoreRoutes();
	console.log("SEO audit passed.");
}

main();
