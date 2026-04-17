import { StrictMode, Suspense, lazy, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import App from "./App.jsx";
import { ensureLiveChatWidget } from "./services/liveChat";

const Analytics = lazy(() =>
	import("@vercel/analytics/react").then((module) => ({ default: module.Analytics }))
);
const SpeedInsights = lazy(() =>
	import("@vercel/speed-insights/react").then((module) => ({ default: module.SpeedInsights }))
);

function DeferredMetrics() {
	const [shouldLoad, setShouldLoad] = useState(false);

	useEffect(() => {
		if (!import.meta.env.PROD || typeof window === "undefined") return;

		const loadMetrics = () => setShouldLoad(true);
		if ("requestIdleCallback" in window) {
			window.requestIdleCallback(loadMetrics, { timeout: 6000 });
		} else {
			window.setTimeout(loadMetrics, 3000);
		}
	}, []);

	if (!import.meta.env.PROD || !shouldLoad) return null;

	return (
		<Suspense fallback={null}>
			<Analytics />
			<SpeedInsights />
		</Suspense>
	);
}

// Boot LiveChat at startup by design; this may reduce bfcache eligibility.
ensureLiveChatWidget();

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<HelmetProvider>
			<App />
		</HelmetProvider>
		<DeferredMetrics />
	</StrictMode>
);

// Register service worker for caching
if ("serviceWorker" in navigator && import.meta.env.PROD) {
	window.addEventListener("load", () => {
		navigator.serviceWorker.register("/sw.js").catch((registrationError) => {
			// Surface SW failures to the browser console (kept as console.warn rather
			// than console.log so it isn't dropped by typical prod log filters) and
			// degrade gracefully — the app works without offline caching.
			console.warn("SW registration failed:", registrationError);
		});
	});
}
