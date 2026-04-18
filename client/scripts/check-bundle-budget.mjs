#!/usr/bin/env node
/**
 * Bundle size budget enforcement.
 *
 * Runs after `vite build` and fails the build when the produced JS/CSS
 * assets exceed the configured budgets (gzipped). Override any budget by
 * setting the matching env var (KB), e.g. BUDGET_TOTAL_JS_KB=250.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join, extname, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distAssets = join(__dirname, "..", "dist", "assets");

const KB = 1024;
const num = (envName, fallbackKb) => {
	const raw = process.env[envName];
	const parsed = raw ? Number(raw) : NaN;
	return Number.isFinite(parsed) && parsed > 0 ? parsed * KB : fallbackKb * KB;
};

// Budgets are gzipped bytes. Tune as the site grows.
const BUDGETS = {
	totalJs: num("BUDGET_TOTAL_JS_KB", 250),
	totalCss: num("BUDGET_TOTAL_CSS_KB", 50),
	perChunkJs: num("BUDGET_PER_CHUNK_JS_KB", 180),
	perChunkCss: num("BUDGET_PER_CHUNK_CSS_KB", 40),
};

function walk(dir) {
	const out = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		const stat = statSync(full);
		if (stat.isDirectory()) out.push(...walk(full));
		else out.push(full);
	}
	return out;
}

let files;
try {
	files = walk(distAssets);
} catch (err) {
	console.error(`[bundle-budget] dist/assets not found at ${distAssets}: ${err.message}`);
	process.exit(1);
}

const fmt = (bytes) => `${(bytes / KB).toFixed(1)} KB`;

const assets = files
	.filter((f) => [".js", ".css"].includes(extname(f)))
	.map((f) => {
		const buf = readFileSync(f);
		const gz = gzipSync(buf).length;
		return { path: relative(distAssets, f), kind: extname(f).slice(1), raw: buf.length, gz };
	})
	.sort((a, b) => b.gz - a.gz);

const totalJs = assets.filter((a) => a.kind === "js").reduce((s, a) => s + a.gz, 0);
const totalCss = assets.filter((a) => a.kind === "css").reduce((s, a) => s + a.gz, 0);

const violations = [];
for (const a of assets) {
	const cap = a.kind === "js" ? BUDGETS.perChunkJs : BUDGETS.perChunkCss;
	if (a.gz > cap) {
		violations.push(
			`per-chunk ${a.kind.toUpperCase()} budget exceeded: ${a.path} ${fmt(a.gz)} > ${fmt(cap)}`,
		);
	}
}
if (totalJs > BUDGETS.totalJs) {
	violations.push(`total JS budget exceeded: ${fmt(totalJs)} > ${fmt(BUDGETS.totalJs)}`);
}
if (totalCss > BUDGETS.totalCss) {
	violations.push(`total CSS budget exceeded: ${fmt(totalCss)} > ${fmt(BUDGETS.totalCss)}`);
}

console.log("\n[bundle-budget] gzipped asset sizes:");
for (const a of assets) {
	console.log(`  ${a.kind.padEnd(3)} ${fmt(a.gz).padStart(9)}  ${a.path}`);
}
console.log(
	`\n[bundle-budget] totals — JS ${fmt(totalJs)} / ${fmt(BUDGETS.totalJs)}, CSS ${fmt(totalCss)} / ${fmt(BUDGETS.totalCss)}`,
);

if (violations.length > 0) {
	console.error("\n[bundle-budget] FAIL");
	for (const v of violations) console.error(`  - ${v}`);
	console.error(
		"\nOverride a budget temporarily with env vars (KB), e.g. BUDGET_TOTAL_JS_KB=300 npm run build.",
	);
	process.exit(1);
}

console.log("[bundle-budget] OK\n");
