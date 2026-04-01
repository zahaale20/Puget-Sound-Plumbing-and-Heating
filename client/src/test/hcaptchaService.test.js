import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Reset module state between tests
let getHCaptchaToken, verifyCaptchaToken;

beforeEach(async () => {
	vi.resetModules();
	// Clear any window-level mocks
	delete window.hcaptcha;
	delete window.onHCaptchaLoad;

	// Remove any hcaptcha containers
	const container = document.getElementById("hcaptcha-invisible");
	if (container) container.remove();

	// Remove any hcaptcha scripts
	document.querySelectorAll('script[src*="hcaptcha"]').forEach((s) => s.remove());
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("getHCaptchaToken", () => {
	it("returns null when site key is not configured", async () => {
		vi.stubEnv("VITE_HCAPTCHA_SITE_KEY", "");

		const mod = await import("../services/hcaptchaService");
		getHCaptchaToken = mod.getHCaptchaToken;

		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		const token = await getHCaptchaToken();

		expect(token).toBeNull();
		expect(warnSpy).toHaveBeenCalledWith("hCaptcha site key not configured");
		warnSpy.mockRestore();
		vi.unstubAllEnvs();
	});

	it("loads hCaptcha script and gets token when site key is set", async () => {
		vi.stubEnv("VITE_HCAPTCHA_SITE_KEY", "test-site-key");

		const mockToken = "test-token-abc123";
		window.hcaptcha = {
			render: vi.fn((container, options) => {
				// Store the callback so execute can trigger it
				window._hcaptchaCallback = options.callback;
				return "widget-0";
			}),
			reset: vi.fn(),
			execute: vi.fn(() => {
				// Simulate the callback being called after execute
				window._hcaptchaCallback(mockToken);
			}),
		};

		const mod = await import("../services/hcaptchaService");
		getHCaptchaToken = mod.getHCaptchaToken;

		const token = await getHCaptchaToken();
		expect(token).toBe(mockToken);
		expect(window.hcaptcha.render).toHaveBeenCalled();
		expect(window.hcaptcha.reset).toHaveBeenCalled();
		expect(window.hcaptcha.execute).toHaveBeenCalled();

		delete window._hcaptchaCallback;
		vi.unstubAllEnvs();
	});

	it("creates invisible container div", async () => {
		vi.stubEnv("VITE_HCAPTCHA_SITE_KEY", "test-site-key");

		window.hcaptcha = {
			render: vi.fn((container, options) => {
				window._hcaptchaCallback = options.callback;
				return "widget-0";
			}),
			reset: vi.fn(),
			execute: vi.fn(() => {
				window._hcaptchaCallback("token");
			}),
		};

		const mod = await import("../services/hcaptchaService");
		getHCaptchaToken = mod.getHCaptchaToken;

		await getHCaptchaToken();

		// Verify container was created
		const container = document.getElementById("hcaptcha-invisible");
		expect(container).not.toBeNull();
		expect(container.style.position).toBe("fixed");
		expect(container.style.zIndex).toBe("9999999");

		delete window._hcaptchaCallback;
		vi.unstubAllEnvs();
	});

	it("returns null on error", async () => {
		vi.stubEnv("VITE_HCAPTCHA_SITE_KEY", "test-site-key");

		// Make hcaptcha throw during reset
		window.hcaptcha = {
			render: vi.fn(() => "widget-0"),
			reset: vi.fn(() => {
				throw new Error("Reset failed");
			}),
			execute: vi.fn(),
		};

		const mod = await import("../services/hcaptchaService");
		getHCaptchaToken = mod.getHCaptchaToken;

		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const token = await getHCaptchaToken();

		expect(token).toBeNull();
		expect(errorSpy).toHaveBeenCalled();
		errorSpy.mockRestore();

		vi.unstubAllEnvs();
	});

	it("handles hCaptcha challenge error", async () => {
		vi.stubEnv("VITE_HCAPTCHA_SITE_KEY", "test-site-key");

		window.hcaptcha = {
			render: vi.fn((container, options) => {
				window._hcaptchaErrorCallback = options["error-callback"];
				return "widget-0";
			}),
			reset: vi.fn(),
			execute: vi.fn(() => {
				// Trigger the error callback
				window._hcaptchaErrorCallback();
			}),
		};

		const mod = await import("../services/hcaptchaService");
		getHCaptchaToken = mod.getHCaptchaToken;

		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const token = await getHCaptchaToken();

		expect(token).toBeNull();
		errorSpy.mockRestore();
		delete window._hcaptchaErrorCallback;
		vi.unstubAllEnvs();
	});
});

describe("verifyCaptchaToken", () => {
	it("sends token to backend API", async () => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8000");
		vi.stubEnv("VITE_HCAPTCHA_SITE_KEY", "test-key");

		const mockResponse = { success: true };
		global.fetch = vi.fn(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			})
		);

		const mod = await import("../services/hcaptchaService");
		verifyCaptchaToken = mod.verifyCaptchaToken;

		const result = await verifyCaptchaToken("test-token");
		expect(result).toEqual(mockResponse);
		expect(global.fetch).toHaveBeenCalledWith(
			"http://localhost:8000/api/verify-captcha",
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify({ token: "test-token" }),
			})
		);

		vi.unstubAllEnvs();
	});
});
