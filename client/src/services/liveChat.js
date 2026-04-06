const LIVE_CHAT_LICENSE_ID = 19626871;
const LIVE_CHAT_SCRIPT_ID = "livechat-tracking-script";

export function isLiveChatEnabled(environment = import.meta.env) {
	return Boolean(environment?.PROD && environment?.VITE_ENABLE_LIVECHAT === "true");
}

export function ensureLiveChatWidget(
	targetWindow = typeof window !== "undefined" ? window : undefined,
	targetDocument = typeof document !== "undefined" ? document : undefined,
	environment = import.meta.env
) {
	if (!isLiveChatEnabled(environment) || !targetWindow || !targetDocument) return null;

	targetWindow.__lc = targetWindow.__lc || {};
	targetWindow.__lc.license = LIVE_CHAT_LICENSE_ID;
	targetWindow.__lc.integration_name = "manual_onboarding";
	targetWindow.__lc.product_name = "livechat";

	(function (browserWindow, browserDocument, arraySlice) {
		const existingWidget = browserWindow.LiveChatWidget;

		function invoke(args) {
			return widget._h ? widget._h.apply(null, args) : widget._q.push(args);
		}

		const widget =
			existingWidget ||
			{
				_q: [],
				_h: null,
				_v: "2.0",
				on: function () {
					invoke(["on", arraySlice.call(arguments)]);
				},
				once: function () {
					invoke(["once", arraySlice.call(arguments)]);
				},
				off: function () {
					invoke(["off", arraySlice.call(arguments)]);
				},
				get: function () {
					if (!widget._h) throw new Error("[LiveChatWidget] You can't use getters before load.");
					return invoke(["get", arraySlice.call(arguments)]);
				},
				call: function () {
					invoke(["call", arraySlice.call(arguments)]);
				},
				init: function () {
					if (browserDocument.getElementById(LIVE_CHAT_SCRIPT_ID)) return;

					const script = browserDocument.createElement("script");
					script.id = LIVE_CHAT_SCRIPT_ID;
					script.async = true;
					script.type = "text/javascript";
					script.src = "https://cdn.livechatinc.com/tracking.js";
					browserDocument.head.appendChild(script);
				},
			};

		if (!existingWidget && !browserWindow.__lc.asyncInit) {
			widget.init();
		}

		browserWindow.LiveChatWidget = widget;
	})(targetWindow, targetDocument, [].slice);

	return targetWindow.LiveChatWidget;
}

export function openLiveChat({
	targetWindow = typeof window !== "undefined" ? window : undefined,
	targetDocument = typeof document !== "undefined" ? document : undefined,
	environment = import.meta.env,
} = {}) {
	const widget = ensureLiveChatWidget(targetWindow, targetDocument, environment);
	if (!widget) return false;

	widget.call("maximize");
	return true;
}