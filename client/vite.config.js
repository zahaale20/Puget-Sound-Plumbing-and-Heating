import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "./src/test/setup.js",
		css: false,
		coverage: {
			reporter: ["text", "lcov"],
				include: ["src/services/formValidation.js"],
			thresholds: {
					lines: 90,
					functions: 90,
					branches: 85,
					statements: 90,
			},
		},
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
