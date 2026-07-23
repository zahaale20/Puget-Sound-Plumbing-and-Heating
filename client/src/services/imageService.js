const BUCKET = "assets";

function getBaseUrl() {
	const storageBase = import.meta.env.VITE_SUPABASE_STORAGE_URL;
	if (!storageBase) {
		console.warn(
			"Missing VITE_SUPABASE_STORAGE_URL environment variable. Set it in client/.env"
		);
		return "";
	}
	return `${storageBase}/storage/v1/object/public/${BUCKET}`;
}

export function getImageUrl(imageKey) {
	if (!imageKey) return "";
	const base = getBaseUrl();
	if (!base) return "";
	const cleanKey = imageKey.startsWith("/") ? imageKey.slice(1) : imageKey;
	return `${base}/${cleanKey}`;
}
