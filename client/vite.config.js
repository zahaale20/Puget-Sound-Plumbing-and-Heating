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
	},
	build: {
		// Enable source maps for production debugging
		sourcemap: false,
		// Optimize chunk size
		chunkSizeWarningLimit: 1000,
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
