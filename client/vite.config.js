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
			include: [
				"src/services/formValidation.js",
				"src/services/imageService.js",
				"src/services/emailService.js",
				"src/services/blogService.js",
			],
			exclude: [
				"src/**/*.test.{js,jsx}",
				"src/test/**",
			],
			thresholds: {
					lines: 85,
					functions: 85,
					branches: 80,
					statements: 85,
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
					// Order matters: more specific matches first.
					if (id.includes("react-router")) return "router-vendor";
					if (id.includes("react-icons")) return "icons-vendor";
					if (id.includes("react") || id.includes("scheduler")) return "react-vendor";
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
