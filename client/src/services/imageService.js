const SUPABASE_URL = import.meta.env.VITE_SUPABASE_STORAGE_URL;

if (!SUPABASE_URL) {
	throw new Error(
		"Missing VITE_SUPABASE_STORAGE_URL environment variable. Set it in client/.env"
	);
}

// Single "assets" bucket. Map legacy prefixes to subfolder paths.
const PREFIX_TO_FOLDER = [
	["private/", "site/"],
	["public/", "logo/"],
];

const BUCKET = "assets";

function resolveStorageUrl(imageKey) {
	if (!imageKey) return "";
	const cleanKey = imageKey.startsWith("/") ? imageKey.slice(1) : imageKey;

	// Rewrite legacy prefixes (private/, public/) to new folder paths
	for (const [prefix, folder] of PREFIX_TO_FOLDER) {
		if (cleanKey.startsWith(prefix)) {
			const objPath = cleanKey.slice(prefix.length);
			return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${folder}${objPath}`;
		}
	}

	// Keys like "blog/slug.webp" or "site/img.png" — already in new format
	return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${cleanKey}`;
}

export const getImageUrl = resolveStorageUrl;

// Backward-compatible alias used across all components
export const getCloudFrontUrl = resolveStorageUrl;

// Generate responsive image sources for different sizes
export const getResponsiveImageUrls = (imageKey, sizes = [400, 800, 1200]) => {
	if (!imageKey) return [];
	const url = resolveStorageUrl(imageKey);
	return sizes.map((size) => ({ src: url, width: size }));
};

// Generate WebP and fallback URLs
export const getOptimizedImageUrls = (imageKey) => {
	if (!imageKey) return { webp: "", fallback: "" };
	const url = resolveStorageUrl(imageKey);
	return { webp: url, fallback: url };
};

// Keep this alias for compatibility
export const getSignedUrl = async (imageKey) => {
	return resolveStorageUrl(imageKey);
};
