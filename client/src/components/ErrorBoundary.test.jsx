import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ErrorBoundary from "./ErrorBoundary.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

beforeEach(() => {
	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => {
		root.unmount();
	});
	container.remove();
	container = null;
	root = null;
});

function Boom() {
	throw new Error("boom");
}

describe("ErrorBoundary", () => {
	it("renders children when nothing throws", () => {
		act(() => {
			root.render(
				<ErrorBoundary>
					<p data-testid="child">ok</p>
				</ErrorBoundary>,
			);
		});
		expect(container.querySelector("[data-testid='child']").textContent).toBe("ok");
	});

	it("renders fallback UI when a child throws", () => {
		// Silence the expected console.error noise from React's boundary path.
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		try {
			act(() => {
				root.render(
					<ErrorBoundary>
						<Boom />
					</ErrorBoundary>,
				);
			});
			const alert = container.querySelector("[role='alert']");
			expect(alert).not.toBeNull();
			expect(alert.textContent).toMatch(/Something went wrong/i);
			expect(container.querySelector("button")).not.toBeNull();
		} finally {
			errorSpy.mockRestore();
		}
	});
});
