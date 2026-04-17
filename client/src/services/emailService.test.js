import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	submitSchedule,
	subscribeNewsletter,
	submitDiyPermit,
	submitJobApplication,
	redeemOffer,
} from "./emailService";

describe("emailService", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	describe("submitSchedule", () => {
		it("POSTs JSON with the captcha token merged in", async () => {
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true, emailStatus: "sent" }),
			});

			const result = await submitSchedule(
				{ firstName: "A", lastName: "B", email: "a@b.com", phone: "2065551234", message: "hi" },
				"captcha-token"
			);

			expect(result).toEqual({ success: true, emailStatus: "sent" });
			expect(fetch).toHaveBeenCalledTimes(1);
			const [url, init] = fetch.mock.calls[0];
			expect(url).toMatch(/\/api\/schedule$/);
			expect(init.method).toBe("POST");
			expect(init.headers["Content-Type"]).toBe("application/json");
			const body = JSON.parse(init.body);
			expect(body).toMatchObject({
				firstName: "A",
				email: "a@b.com",
				captchaToken: "captcha-token",
			});
		});

		it("throws with the server-provided detail when the response is not ok", async () => {
			fetch.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ detail: "Captcha failed." }),
			});
			await expect(
				submitSchedule({ firstName: "A" }, "tok")
			).rejects.toThrow(/Captcha failed/);
		});

		it("throws a generic message when the body is not JSON", async () => {
			fetch.mockResolvedValueOnce({
				ok: false,
				json: async () => {
					throw new Error("not json");
				},
			});
			await expect(
				submitSchedule({ firstName: "A" }, "tok")
			).rejects.toThrow(/An error occurred/);
		});
	});

	describe("subscribeNewsletter", () => {
		it("returns the parsed response for a successful subscription", async () => {
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true, emailStatus: "sent" }),
			});
			await expect(
				subscribeNewsletter("a@b.com", "tok")
			).resolves.toEqual({ success: true, emailStatus: "sent" });
		});

		it("surfaces the failure detail when the request is rejected", async () => {
			fetch.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ detail: "Too many requests" }),
			});
			await expect(
				subscribeNewsletter("a@b.com", "tok")
			).rejects.toThrow(/Too many requests/);
		});
	});

	describe("submitDiyPermit", () => {
		it("posts the form payload with captcha", async () => {
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true }),
			});
			await submitDiyPermit({ firstName: "A", email: "a@b.com" }, "tok");
			const [, init] = fetch.mock.calls[0];
			const body = JSON.parse(init.body);
			expect(body.captchaToken).toBe("tok");
			expect(body.email).toBe("a@b.com");
		});

		it("surfaces the server detail when the request fails", async () => {
			fetch.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ detail: "DB down" }),
			});
			await expect(submitDiyPermit({}, "tok")).rejects.toThrow(/DB down/);
		});

		it("falls back to a generic error when the body is unreadable", async () => {
			fetch.mockResolvedValueOnce({
				ok: false,
				json: async () => {
					throw new Error("nope");
				},
			});
			await expect(submitDiyPermit({}, "tok")).rejects.toThrow(/Failed to submit/);
		});
	});

	describe("submitJobApplication", () => {
		it("sends multipart form-data including the resume and captcha", async () => {
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true }),
			});

			const resume = new File(["pdf-bytes"], "resume.pdf", { type: "application/pdf" });
			await submitJobApplication(
				{
					firstName: "A",
					lastName: "B",
					phone: "2065551234",
					email: "a@b.com",
					position: "Plumber",
					experience: "5 years",
					message: "hello",
					additionalInfo: "n/a",
				},
				resume,
				"tok"
			);

			const [url, init] = fetch.mock.calls[0];
			expect(url).toMatch(/\/api\/job-application$/);
			expect(init.method).toBe("POST");
			expect(init.body).toBeInstanceOf(FormData);
			expect(init.body.get("firstName")).toBe("A");
			expect(init.body.get("position")).toBe("Plumber");
			expect(init.body.get("captchaToken")).toBe("tok");
			expect(init.body.get("resume")).toBe(resume);
		});

		it("omits the resume and captcha fields when not provided", async () => {
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true }),
			});
			await submitJobApplication(
				{ firstName: "A", lastName: "B", phone: "1", email: "a@b.com", position: "P" },
				null,
				null
			);
			const [, init] = fetch.mock.calls[0];
			expect(init.body.has("resume")).toBe(false);
			expect(init.body.has("captchaToken")).toBe(false);
			expect(init.body.get("experience")).toBe("");
		});

		it("rejects with the server detail on a non-2xx response", async () => {
			fetch.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ detail: "Resume too large" }),
			});
			await expect(
				submitJobApplication({ firstName: "A" }, null, "tok")
			).rejects.toThrow(/Resume too large/);
		});

		it("falls back to a generic message when the error body is unreadable", async () => {
			fetch.mockResolvedValueOnce({
				ok: false,
				json: async () => {
					throw new Error("nope");
				},
			});
			await expect(
				submitJobApplication({ firstName: "A" }, null, "tok")
			).rejects.toThrow(/Failed to submit application/);
		});
	});

	describe("redeemOffer", () => {
		it("posts coupon details with the captcha token", async () => {
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true }),
			});
			await redeemOffer(
				{ firstName: "A", email: "a@b.com", couponDiscount: "$19.50 OFF" },
				"tok"
			);
			const [url, init] = fetch.mock.calls[0];
			expect(url).toMatch(/\/api\/redeem-offer$/);
			const body = JSON.parse(init.body);
			expect(body.captchaToken).toBe("tok");
			expect(body.couponDiscount).toBe("$19.50 OFF");
		});

		it("rejects with the server detail when redemption fails", async () => {
			fetch.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ detail: "Already redeemed" }),
			});
			await expect(redeemOffer({}, "tok")).rejects.toThrow(/Already redeemed/);
		});

		it("falls back to a generic message when the body is unreadable", async () => {
			fetch.mockResolvedValueOnce({
				ok: false,
				json: async () => {
					throw new Error("nope");
				},
			});
			await expect(redeemOffer({}, "tok")).rejects.toThrow(/Failed to redeem/);
		});
	});
});
