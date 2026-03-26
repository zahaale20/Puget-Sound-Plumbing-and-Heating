const CLOUDFRONT_BASE = import.meta.env.VITE_CLOUDFRONT_URL || "https://d1fyhmg0o2pfye.cloudfront.net";

if (!CLOUDFRONT_BASE) {
	throw new Error(
		"Missing VITE_CLOUDFRONT_URL environment variable. Set VITE_CLOUDFRONT_URL in client/.env"
	);
}

export const getCloudFrontUrl = (imageKey) => {
	if (!imageKey) return "";
	const cleanKey = imageKey.startsWith("/") ? imageKey.slice(1) : imageKey;
	return `${CLOUDFRONT_BASE}/${cleanKey}`;
};

// Generate responsive image sources for different sizes
export const getResponsiveImageUrls = (imageKey, sizes = [400, 800, 1200]) => {
	if (!imageKey) return [];
	const cleanKey = imageKey.startsWith("/") ? imageKey.slice(1) : imageKey;
	return sizes.map((size) => ({
		src: `${CLOUDFRONT_BASE}/${cleanKey}`,
		width: size,
	}));
};

// Generate WebP and fallback URLs
export const getOptimizedImageUrls = (imageKey) => {
	if (!imageKey) return { webp: "", fallback: "" };
	const cleanKey = imageKey.startsWith("/") ? imageKey.slice(1) : imageKey;
	const baseUrl = `${CLOUDFRONT_BASE}/${cleanKey}`;

	// For now, return the same URL - CloudFront can be configured to serve WebP
	// when client accepts it via Accept header
	return {
		webp: baseUrl,
		fallback: baseUrl,
	};
};

// Keep this alias for compatibility, but it now resolves through CloudFront.
export const getSignedUrl = async (imageKey) => {
	return getCloudFrontUrl(imageKey);
};
