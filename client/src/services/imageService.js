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
