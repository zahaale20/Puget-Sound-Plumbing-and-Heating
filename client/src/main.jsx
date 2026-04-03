import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./index.css";
import App from "./App.jsx";

function initLiveChat() {
	if (!import.meta.env.PROD || typeof window === "undefined") return;
	if (window.LiveChatWidget || document.getElementById("livechat-tracking-script")) return;

	window.__lc = window.__lc || {};
	window.__lc.license = 19626871;
	window.__lc.integration_name = "manual_onboarding";
	window.__lc.product_name = "livechat";

	(function (n, t, c) {
		function i(args) {
			return e._h ? e._h.apply(null, args) : e._q.push(args);
		}

		const e = {
			_q: [],
			_h: null,
			_v: "2.0",
			on: function () {
				i(["on", c.call(arguments)]);
			},
			once: function () {
				i(["once", c.call(arguments)]);
			},
			off: function () {
				i(["off", c.call(arguments)]);
			},
			get: function () {
				if (!e._h) throw new Error("[LiveChatWidget] You can't use getters before load.");
				return i(["get", c.call(arguments)]);
			},
			call: function () {
				i(["call", c.call(arguments)]);
			},
			init: function () {
				const script = t.createElement("script");
				script.id = "livechat-tracking-script";
				script.async = true;
				script.type = "text/javascript";
				script.src = "https://cdn.livechatinc.com/tracking.js";
				t.head.appendChild(script);
			},
		};

		if (!n.__lc.asyncInit) {
			e.init();
		}

		n.LiveChatWidget = n.LiveChatWidget || e;
	})(window, document, [].slice);
}

function initLiveChatDeferred() {
	if (!import.meta.env.PROD || typeof window === "undefined") return;

	let hasStarted = false;
	const start = () => {
		if (hasStarted) return;
		hasStarted = true;
		window.removeEventListener("pointerdown", start);
		window.removeEventListener("keydown", start);
		window.removeEventListener("scroll", start);
		initLiveChat();
	};

	window.addEventListener("pointerdown", start, { once: true, passive: true });
	window.addEventListener("keydown", start, { once: true });
	window.addEventListener("scroll", start, { once: true, passive: true });

	if ("requestIdleCallback" in window) {
		window.requestIdleCallback(start, { timeout: 45000 });
	} else {
		window.setTimeout(start, 45000);
	}
}

initLiveChatDeferred();

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<HelmetProvider>
			<App />
		</HelmetProvider>
		<Analytics />
		<SpeedInsights />
	</StrictMode>
);

// Register service worker for caching
if ("serviceWorker" in navigator && import.meta.env.PROD) {
	window.addEventListener("load", () => {
		navigator.serviceWorker
			.register("/sw.js")
			.then((registration) => {
				console.log("SW registered: ", registration);
			})
			.catch((registrationError) => {
				console.log("SW registration failed: ", registrationError);
			});
	});
}
