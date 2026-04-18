import { StrictMode, Suspense, lazy, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
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

// Defer LiveChat until the browser is idle. Loading the widget eagerly costs
// LCP and blocks the main thread on first paint; idle-loading keeps it
// non-critical while still attaching it well before users typically engage.
function deferLiveChat() {
	if (typeof window === "undefined") return;
	const boot = () => {
		try {
			ensureLiveChatWidget();
		} catch (e) {
			console.warn("LiveChat boot failed:", e);
		}
	};
	if ("requestIdleCallback" in window) {
		window.requestIdleCallback(boot, { timeout: 4000 });
	} else {
		window.setTimeout(boot, 2500);
	}
}

deferLiveChat();

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<ErrorBoundary>
			<HelmetProvider>
				<App />
			</HelmetProvider>
			<DeferredMetrics />
		</ErrorBoundary>
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
