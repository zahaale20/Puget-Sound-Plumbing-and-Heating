// Basic service worker for caching static assets
const CACHE_NAME = "pspah-v1";
const CLOUDFRONT_URL = "https://d1fyhmg0o2pfye.cloudfront.net";
const STATIC_CACHE_URLS = [
	"/",
	"/assets/",
	`${CLOUDFRONT_URL}/public/pspah-logo.png`,
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(STATIC_CACHE_URLS);
		})
	);
});

// Fetch event - serve from cache when possible
self.addEventListener("fetch", (event) => {
	// Only cache GET requests
	if (event.request.method !== "GET") return;

	// Handle navigation requests
	if (event.request.mode === "navigate") {
		event.respondWith(
			fetch(event.request).catch(() => {
				return caches.match("/");
			})
		);
		return;
	}

	// Handle static assets
	event.respondWith(
		caches.match(event.request).then((response) => {
			// Return cached version or fetch from network
			return (
				response ||
				fetch(event.request).then((response) => {
					// Cache successful responses
					if (response.status === 200) {
						const responseClone = response.clone();
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(event.request, responseClone);
						});
					}
					return response;
				})
			);
		})
	);
});

// Activate event - clean up old caches
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
		})
	);
});
