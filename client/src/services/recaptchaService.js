/**
 * Google reCAPTCHA v3 Service
 * Provides token generation and backend verification for spam prevention
 */

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

/**
 * Load reCAPTCHA script if not already loaded
 */
export const loadRecaptcha = () => {
	if (window.grecaptcha) {
		return Promise.resolve();
	}

	return new Promise((resolve, reject) => {
		if (!RECAPTCHA_SITE_KEY) {
			reject(new Error("reCAPTCHA site key not configured"));
			return;
		}
		const script = document.createElement("script");
		script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
		script.async = true;
		script.defer = true;
		script.onload = resolve;
		script.onerror = reject;
		document.head.appendChild(script);
	});
};

/**
 * Get reCAPTCHA v3 token for a specific action
 * @param {string} action - The action name (e.g., 'schedule', 'job_apply', 'newsletter')
 * @returns {Promise<string>} reCAPTCHA token
 */
export const getRecaptchaToken = async (action = "submit") => {
	try {
		if (!RECAPTCHA_SITE_KEY) {
			console.warn("reCAPTCHA site key not configured");
			return null;
		}

		return await new Promise((resolve, reject) => {
			const execute = () => {
				window.grecaptcha
					.execute(RECAPTCHA_SITE_KEY, { action })
					.then(resolve)
					.catch(reject);
			};

			if (window.grecaptcha && window.grecaptcha.ready) {
				window.grecaptcha.ready(execute);
			} else {
				loadRecaptcha()
					.then(() => window.grecaptcha.ready(execute))
					.catch(reject);
			}
		});
	} catch (error) {
		console.error("Failed to get reCAPTCHA token:", error);
		return null;
	}
};

/**
 * Verify token on backend (call this from your form submission)
 * @param {string} token - The reCAPTCHA token from the frontend
 * @returns {Promise<object>} Verification result with success and score
 */
export const verifyRecaptchaToken = async (token) => {
	try {
		const response = await fetch(
			`${import.meta.env.VITE_API_BASE_URL}/api/verify-recaptcha`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ token }),
			}
		);

		if (!response.ok) {
			throw new Error("reCAPTCHA verification failed");
		}

		return await response.json();
	} catch (error) {
		console.error("reCAPTCHA verification error:", error);
		return { success: false };
	}
};
