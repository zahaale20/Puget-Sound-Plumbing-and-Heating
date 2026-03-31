/**
 * hCaptcha Service
 * Provides invisible captcha token generation for spam prevention
 */

const HCAPTCHA_SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

let hcaptchaReady = false;
let hcaptchaWidgetId = null;
let pendingResolve = null;
let pendingReject = null;

/**
 * Load hCaptcha script if not already loaded
 */
const loadHCaptcha = () => {
	if (window.hcaptcha) {
		hcaptchaReady = true;
		return Promise.resolve();
	}

	return new Promise((resolve, reject) => {
		if (!HCAPTCHA_SITE_KEY) {
			reject(new Error("hCaptcha site key not configured"));
			return;
		}

		// hCaptcha calls this global callback when ready
		window.onHCaptchaLoad = () => {
			hcaptchaReady = true;
			resolve();
		};

		const script = document.createElement("script");
		script.src = "https://js.hcaptcha.com/1/api.js?onload=onHCaptchaLoad&render=explicit";
		script.async = true;
		script.defer = true;
		script.onerror = reject;
		document.head.appendChild(script);
	});
};

/**
 * Render the invisible hCaptcha widget (once)
 */
const ensureWidget = () => {
	if (hcaptchaWidgetId !== null) return;

	// Create a hidden container for the invisible widget
	let container = document.getElementById("hcaptcha-invisible");
	if (!container) {
		container = document.createElement("div");
		container.id = "hcaptcha-invisible";
		container.style.display = "none";
		document.body.appendChild(container);
	}

	hcaptchaWidgetId = window.hcaptcha.render(container, {
		sitekey: HCAPTCHA_SITE_KEY,
		size: "invisible",
		callback: (token) => {
			if (pendingResolve) {
				pendingResolve(token);
				pendingResolve = null;
				pendingReject = null;
			}
		},
		"error-callback": () => {
			if (pendingReject) {
				pendingReject(new Error("hCaptcha challenge error"));
				pendingResolve = null;
				pendingReject = null;
			}
		},
	});
};

/**
 * Get hCaptcha token (invisible — no user interaction unless suspicious)
 * @returns {Promise<string>} hCaptcha token
 */
export const getHCaptchaToken = async () => {
	try {
		if (!HCAPTCHA_SITE_KEY) {
			console.warn("hCaptcha site key not configured");
			return null;
		}

		if (!hcaptchaReady) {
			await loadHCaptcha();
		}

		ensureWidget();

		// Reset before each execute to get a fresh token
		window.hcaptcha.reset(hcaptchaWidgetId);

		return await new Promise((resolve, reject) => {
			pendingResolve = resolve;
			pendingReject = reject;
			window.hcaptcha.execute(hcaptchaWidgetId);
		});
	} catch (error) {
		console.error("Failed to get hCaptcha token:", error);
		return null;
	}
};

/**
 * Verify token on backend
 * @param {string} token - The hCaptcha token
 * @returns {Promise<object>} Verification result
 */
export const verifyCaptchaToken = async (token) => {
	try {
		const response = await fetch(
			`${import.meta.env.VITE_API_BASE_URL}/api/verify-captcha`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token }),
			}
		);

		if (!response.ok) {
			throw new Error("Captcha verification failed");
		}

		return await response.json();
	} catch (error) {
		console.error("Captcha verification error:", error);
		return { success: false };
	}
};
