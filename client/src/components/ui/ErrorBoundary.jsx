import { Component } from "react";

/**
 * Top-level error boundary.
 *
 * Catches render-time errors from anywhere in the React tree and renders a
 * minimal recovery UI rather than dumping a blank white page on users. Errors
 * are reported to Sentry when the SDK is loaded (configured by the host page)
 * and to the browser console either way.
 *
 * This sits ABOVE the route layer in `main.jsx` so it survives even when a
 * lazy-loaded page bundle fails to evaluate.
 */
export default class ErrorBoundary extends Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error, info) {
		// Best-effort Sentry reporting; never throws if Sentry isn't loaded.
		if (typeof window !== "undefined" && window.Sentry?.captureException) {
			try {
				window.Sentry.captureException(error, { extra: info });
			} catch {
				/* swallow — error reporting must not crash the boundary */
			}
		}
		// Always log so the failure is visible in dev tools.
		console.error("Unhandled UI error:", error, info);
	}

	handleReload = () => {
		window.location.reload();
	};

	render() {
		if (this.state.hasError) {
			return (
				<div
					role="alert"
					style={{
						minHeight: "60vh",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						padding: "2rem",
						textAlign: "center",
						fontFamily: "system-ui, sans-serif",
					}}
				>
					<h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
						Something went wrong.
					</h1>
					<p style={{ marginBottom: "1.25rem", maxWidth: "32rem" }}>
						We hit an unexpected error. Reload the page, or call us at{" "}
						<a href="tel:+12067832544" style={{ textDecoration: "underline" }}>
							(206) 783-2544
						</a>{" "}
						and we&rsquo;ll help you out.
					</p>
					<button
						type="button"
						onClick={this.handleReload}
						style={{
							padding: "0.6rem 1.2rem",
							borderRadius: "0.375rem",
							border: "1px solid #1f2937",
							background: "#1f2937",
							color: "white",
							cursor: "pointer",
						}}
					>
						Reload page
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}