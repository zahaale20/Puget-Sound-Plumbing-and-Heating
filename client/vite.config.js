import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function inlineBuiltCss() {
	return {
		name: "inline-built-css",
		apply: "build",
		enforce: "post",
		generateBundle(_, bundle) {
			const cssAssets = new Map(
				Object.entries(bundle)
					.filter(
						([fileName, output]) => output.type === "asset" && fileName.endsWith(".css")
					)
					.map(([fileName, output]) => [fileName, String(output.source)]),
			);

			if (cssAssets.size === 0) {
				return;
			}

			const inlinedCssFiles = new Set();

			for (const [fileName, output] of Object.entries(bundle)) {
				if (output.type !== "asset" || !fileName.endsWith(".html")) {
					continue;
				}

				let html = String(output.source);

				for (const [cssFileName, cssSource] of cssAssets) {
					const escapedFileName = cssFileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
					const stylesheetLinkPattern = new RegExp(
						`<link\\s+[^>]*rel=["']stylesheet["'][^>]*href=["'](?:\\.\\/|\\/)?${escapedFileName}["'][^>]*>`,
						"g",
					);

					if (!stylesheetLinkPattern.test(html)) {
						continue;
					}

					html = html.replace(
						stylesheetLinkPattern,
						`<style data-inline-css="${cssFileName}">\n${cssSource}\n</style>`,
					);
					inlinedCssFiles.add(cssFileName);
				}

				output.source = html;
			}

			for (const cssFileName of inlinedCssFiles) {
				delete bundle[cssFileName];
			}
		},
	};
}

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss(), inlineBuiltCss()],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "./src/test/setup.js",
		css: false,
	},
	build: {
		// Enable source maps for production debugging
		sourcemap: false,
		// Optimize chunk size
		chunkSizeWarningLimit: 1000,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (!id.includes("node_modules")) return;
					if (id.includes("react") || id.includes("scheduler")) return "react-vendor";
					if (id.includes("react-router")) return "router-vendor";
					if (id.includes("react-icons") || id.includes("lucide-react")) return "icons-vendor";
					if (id.includes("framer-motion")) return "motion-vendor";
					if (id.includes("@supabase")) return "supabase-vendor";
				},
			},
		},
	},
	server: {
		fs: {
			// Allow serving files from one level up to the project root
			allow: [".."],
		},
		proxy: {
			"/api": {
				target: "http://127.0.0.1:8001",
				changeOrigin: true,
			},
		},
	},
});
