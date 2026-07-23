// Basic service worker for caching static assets only
const CACHE_NAME = "pspah-v6";
// Cache only the app shell on install — no external URLs that could 404 and
// break the service worker install when the Supabase project changes.
const STATIC_CACHE_URLS = ["/"];

// URLs/origins that must never be cached (API calls, dynamic data)
const BYPASS_CACHE_ORIGINS = [];

function isApiRequest(url) {
	return BYPASS_CACHE_ORIGINS.some((origin) => url.hostname.includes(origin));
}

function isStaticAsset(url) {
	// Same-origin static assets: JS, CSS, fonts, images bundled by Vite
	if (url.origin === self.location.origin) {
		return /\.(js|css|woff2?|ttf|eot|png|jpg|jpeg|webp|gif|svg|ico)(\?.*)?$/.test(url.pathname);
	}
	// Supabase Storage images — match any Supabase project (*.supabase.co)
	if (url.hostname.endsWith(".supabase.co")) {
		return true;
	}
	return false;
}

function isCacheableAssetResponse(url, response) {
	if (!response || !response.ok) return false;

	const contentType = response.headers.get("content-type") || "";

	// Prevent caching HTML fallback responses for asset requests.
	if (url.origin === self.location.origin) {
		if (url.pathname.endsWith(".css")) return contentType.includes("text/css");
		if (url.pathname.endsWith(".js")) return contentType.includes("javascript");
	}

	return true;
}

// Install event - cache critical static assets
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(STATIC_CACHE_URLS);
		})
	);
	// Take control immediately
	self.skipWaiting();
});

// Fetch event - network-first for API, cache-first for static assets
self.addEventListener("fetch", (event) => {
	// Only handle GET requests
	if (event.request.method !== "GET") return;

	const url = new URL(event.request.url);

	// Always go to network for API requests (Supabase, etc.)
	if (isApiRequest(url)) {
		return; // Let browser handle it without SW interference
	}

	// Handle navigation requests - network first, fallback to shell
	if (event.request.mode === "navigate") {
		event.respondWith(
			fetch(event.request).catch(() => {
				return caches.match("/");
			})
		);
		return;
	}

	// Cache-first for known static assets only
	if (isStaticAsset(url)) {
		event.respondWith(
			caches.match(event.request).then((cached) => {
				return (
					cached ||
					fetch(event.request).then((response) => {
						if (isCacheableAssetResponse(url, response)) {
							const clone = response.clone();
							caches.open(CACHE_NAME).then((cache) => {
								cache.put(event.request, clone);
							});
						}
						return response;
					})
				);
			})
		);
		return;
	}

	// For everything else, go to network without caching
});

// Activate event - clean up old caches and claim clients immediately
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheName !== CACHE_NAME) {
						return caches.delete(cacheName);
					}
				})
			);
		}).then(() => self.clients.claim())
	);
});
