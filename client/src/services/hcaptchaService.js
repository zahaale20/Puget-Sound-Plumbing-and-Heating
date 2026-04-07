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

	// Create a container for the invisible widget that stays centered on screen
	let container = document.getElementById("hcaptcha-invisible");
	if (!container) {
		container = document.createElement("div");
		container.id = "hcaptcha-invisible";
		container.style.position = "fixed";
		container.style.top = "0";
		container.style.left = "0";
		container.style.width = "100%";
		container.style.height = "100%";
		container.style.display = "flex";
		container.style.alignItems = "center";
		container.style.justifyContent = "center";
		container.style.zIndex = "9999999";
		container.style.pointerEvents = "none";
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


