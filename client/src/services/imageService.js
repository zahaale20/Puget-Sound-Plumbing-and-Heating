const STORAGE_BASE = import.meta.env.VITE_SUPABASE_STORAGE_URL;

if (!STORAGE_BASE) {
	throw new Error(
		"Missing VITE_SUPABASE_STORAGE_URL environment variable. Set it in client/.env"
	);
}

const BUCKET = "assets";
const BASE_URL = `${STORAGE_BASE}/storage/v1/object/public/${BUCKET}`;

export function getImageUrl(imageKey) {
	if (!imageKey) return "";
	const cleanKey = imageKey.startsWith("/") ? imageKey.slice(1) : imageKey;
	return `${BASE_URL}/${cleanKey}`;
}

// Generate responsive image sources for different sizes
export const getResponsiveImageUrls = (imageKey, sizes = [400, 800, 1200]) => {
	if (!imageKey) return [];
	const url = getImageUrl(imageKey);
	return sizes.map((size) => ({ src: url, width: size }));
};

// Generate WebP and fallback URLs
export const getOptimizedImageUrls = (imageKey) => {
	if (!imageKey) return { webp: "", fallback: "" };
	const url = getImageUrl(imageKey);
	return { webp: url, fallback: url };
};

// Keep this alias for compatibility
export const getSignedUrl = async (imageKey) => {
	return getImageUrl(imageKey);
};
