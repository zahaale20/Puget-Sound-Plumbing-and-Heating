/**
 * reCAPTCHA v3 client utilities
 * Provides token generation and verification
 */

/**
 * Get reCAPTCHA token for form submission
 * @returns {Promise<string>} reCAPTCHA token
 */
export const getRecaptchaToken = async () => {
  try {
    if (window.grecaptcha) {
      const token = await window.grecaptcha.execute(
        import.meta.env.VITE_RECAPTCHA_SITE_KEY,
        { action: 'submit' }
      );
      return token;
    }
    console.warn('reCAPTCHA not loaded');
    return null;
  } catch (error) {
    console.error('Error getting reCAPTCHA token:', error);
    return null;
  }
};
