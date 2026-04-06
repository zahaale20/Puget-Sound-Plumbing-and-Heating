import { ensureLiveChatWidget, isLiveChatEnabled, openLiveChat } from "./liveChat";

function createMockDocument() {
	const appendedScripts = [];

	return {
		head: {
			appendChild: vi.fn((node) => {
				appendedScripts.push(node);
			}),
		},
		createElement: vi.fn(() => ({})),
		getElementById: vi.fn((id) => appendedScripts.find((node) => node.id === id) ?? null),
	};
}

describe("isLiveChatEnabled", () => {
	it("requires production mode and the feature flag", () => {
		expect(isLiveChatEnabled({ PROD: true, VITE_ENABLE_LIVECHAT: "true" })).toBe(true);
		expect(isLiveChatEnabled({ PROD: false, VITE_ENABLE_LIVECHAT: "true" })).toBe(false);
		expect(isLiveChatEnabled({ PROD: true, VITE_ENABLE_LIVECHAT: "false" })).toBe(false);
	});
});

describe("openLiveChat", () => {
	it("returns false when live chat is disabled", () => {
		expect(
			openLiveChat({
				targetWindow: {},
				targetDocument: createMockDocument(),
				environment: { PROD: false, VITE_ENABLE_LIVECHAT: "true" },
			})
		).toBe(false);
	});

	it("injects the tracking script and queues maximize on first open", () => {
		const targetWindow = {};
		const targetDocument = createMockDocument();
		const environment = { PROD: true, VITE_ENABLE_LIVECHAT: "true" };

		expect(openLiveChat({ targetWindow, targetDocument, environment })).toBe(true);
		expect(targetWindow.__lc.license).toBe(19626871);
		expect(targetDocument.createElement).toHaveBeenCalledWith("script");
		expect(targetDocument.head.appendChild).toHaveBeenCalledTimes(1);
		expect(targetWindow.LiveChatWidget._q).toContainEqual(["call", ["maximize"]]);
	});

	it("reuses an existing widget without injecting a second script", () => {
		const targetDocument = createMockDocument();
		const existingWidget = {
			call: vi.fn(),
		};
		const targetWindow = {
			LiveChatWidget: existingWidget,
		};
		const environment = { PROD: true, VITE_ENABLE_LIVECHAT: "true" };

		expect(ensureLiveChatWidget(targetWindow, targetDocument, environment)).toBe(existingWidget);
		expect(openLiveChat({ targetWindow, targetDocument, environment })).toBe(true);
		expect(existingWidget.call).toHaveBeenCalledWith("maximize");
		expect(targetDocument.head.appendChild).not.toHaveBeenCalled();
	});
});