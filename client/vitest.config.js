import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: "jsdom",
      exclude: ["e2e/**", "node_modules/**"],
      setupFiles: ["./src/test/setup.js"],
      coverage: {
        provider: "v8",
        reporter: ["text", "lcov"],
        all: true,
        include: ["src/**/*.{js,jsx}"],
        exclude: [
          "src/test/**",
          "src/**/*.test.{js,jsx}",
          "src/**/*.spec.{js,jsx}",
          "src/mocks/**",
          "src/setupTests.js",
        ],
        // Apply the coverage gate to all app source files, not only the
        // already well-covered services/forms. These baseline thresholds
        // should be ratcheted upward as page, layout, SEO, and route tests land.
        thresholds: {
          statements: 30,
          branches: 70,
          functions: 40,
          lines: 30,
        },
      },
    },
  }),
);
