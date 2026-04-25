// Wrap fetch with an AbortController so a slow/hung backend doesn't leave
// the user staring at a spinner. Defaults to 20s; submit endpoints may pass
// a longer value via opts.timeoutMs. Throws a typed error on timeout so
// callers can show a "request took too long" message.

const DEFAULT_TIMEOUT_MS = 20_000;

export class FetchTimeoutError extends Error {
	constructor(timeoutMs) {
		super(`Request timed out after ${timeoutMs}ms`);
		this.name = "FetchTimeoutError";
		this.timeoutMs = timeoutMs;
	}
}

export async function fetchWithTimeout(input, init = {}, opts = {}) {
	const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

	// Honour a caller-supplied signal by chaining it to ours.
	const controller = new AbortController();
	const onAbort = () => controller.abort();
	if (init.signal) {
		if (init.signal.aborted) controller.abort();
		else init.signal.addEventListener("abort", onAbort, { once: true });
	}

	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		return await fetch(input, { ...init, signal: controller.signal });
	} catch (err) {
		if (err?.name === "AbortError" && !init.signal?.aborted) {
			throw new FetchTimeoutError(timeoutMs);
		}
		throw err;
	} finally {
		clearTimeout(timer);
		if (init.signal) init.signal.removeEventListener("abort", onAbort);
	}
}
