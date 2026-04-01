import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock import.meta.env before importing the module
vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8001");

const {
	sendFollowUpEmail,
	submitSchedule,
	subscribeNewsletter,
	submitDiyPermit,
	submitJobApplication,
	redeemOffer,
} = await import("../services/emailService.js");

describe("emailService", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	// ── sendFollowUpEmail ────────────────────────────────────────────────

	describe("sendFollowUpEmail", () => {
		it("sends POST with email and firstName", async () => {
			const mockResponse = { success: true, emailStatus: "sent" };
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			const result = await sendFollowUpEmail("user@example.com", "Jane");

			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:8001/api/send-email",
				expect.objectContaining({
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email: "user@example.com", firstName: "Jane" }),
				})
			);
			expect(result).toEqual(mockResponse);
		});

		it("throws on non-ok response", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				json: () => Promise.resolve({ detail: "Rate limit exceeded." }),
			});

			await expect(sendFollowUpEmail("user@example.com", "Jane")).rejects.toThrow(
				"Rate limit exceeded."
			);
		});

		it("throws default message when error response has no detail", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				json: () => Promise.reject(new Error("parse error")),
			});

			await expect(sendFollowUpEmail("user@example.com", "Jane")).rejects.toThrow(
				"Failed to send email"
			);
		});

		it("re-throws fetch errors", async () => {
			global.fetch = vi.fn().mockRejectedValue(new Error("Network failure"));

			await expect(sendFollowUpEmail("user@example.com", "Jane")).rejects.toThrow(
				"Network failure"
			);
		});
	});

	// ── submitSchedule ───────────────────────────────────────────────────

	describe("submitSchedule", () => {
		it("sends form data with captcha token", async () => {
			const formData = {
				firstName: "John",
				lastName: "Doe",
				phone: "2065551234",
				email: "john@example.com",
				message: "Help needed",
			};
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ success: true }),
			});

			await submitSchedule(formData, "captcha-tok");

			const callBody = JSON.parse(fetch.mock.calls[0][1].body);
			expect(callBody.firstName).toBe("John");
			expect(callBody.captchaToken).toBe("captcha-tok");
			expect(fetch.mock.calls[0][0]).toBe("http://localhost:8001/api/schedule");
		});

		it("throws on server error", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				json: () => Promise.resolve({ detail: "Server error" }),
			});

			await expect(submitSchedule({}, null)).rejects.toThrow("Server error");
		});
	});

	// ── subscribeNewsletter ──────────────────────────────────────────────

	describe("subscribeNewsletter", () => {
		it("sends email and token", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ success: true }),
			});

			await subscribeNewsletter("sub@example.com", "tok123");

			const callBody = JSON.parse(fetch.mock.calls[0][1].body);
			expect(callBody.email).toBe("sub@example.com");
			expect(callBody.captchaToken).toBe("tok123");
		});

		it("throws on failure", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				json: () => Promise.resolve({ message: "Already subscribed" }),
			});

			await expect(subscribeNewsletter("sub@example.com", null)).rejects.toThrow(
				"Already subscribed"
			);
		});
	});

	// ── submitDiyPermit ──────────────────────────────────────────────────

	describe("submitDiyPermit", () => {
		it("sends form data correctly", async () => {
			const formData = {
				firstName: "Bob",
				lastName: "Builder",
				email: "bob@example.com",
				phone: "206555",
				address: "123 Main",
			};
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ success: true }),
			});

			await submitDiyPermit(formData, "cap-tok");

			expect(fetch.mock.calls[0][0]).toBe("http://localhost:8001/api/diy-permit");
			const callBody = JSON.parse(fetch.mock.calls[0][1].body);
			expect(callBody.firstName).toBe("Bob");
		});
	});

	// ── submitJobApplication ─────────────────────────────────────────────

	describe("submitJobApplication", () => {
		it("sends FormData without resume", async () => {
			const formData = {
				firstName: "Alice",
				lastName: "Smith",
				phone: "206",
				email: "alice@example.com",
				position: "Plumber",
				experience: "",
				message: "",
				additionalInfo: "",
			};
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ success: true }),
			});

			await submitJobApplication(formData, null, "tok");

			expect(fetch.mock.calls[0][0]).toBe("http://localhost:8001/api/job-application");
			const body = fetch.mock.calls[0][1].body;
			expect(body).toBeInstanceOf(FormData);
			expect(body.get("firstName")).toBe("Alice");
			expect(body.get("resume")).toBeNull();
		});

		it("appends resume when provided", async () => {
			const formData = {
				firstName: "Alice",
				lastName: "Smith",
				phone: "206",
				email: "alice@example.com",
				position: "Plumber",
				experience: "",
				message: "",
				additionalInfo: "",
			};
			const fakeFile = new File(["pdf-content"], "resume.pdf", {
				type: "application/pdf",
			});

			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ success: true }),
			});

			await submitJobApplication(formData, fakeFile, "tok");

			const body = fetch.mock.calls[0][1].body;
			expect(body.get("resume")).toBeTruthy();
		});

		it("throws on error response", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				json: () => Promise.resolve({ detail: "Validation error" }),
			});

			await expect(
				submitJobApplication(
					{
						firstName: "",
						lastName: "",
						phone: "",
						email: "",
						position: "",
						experience: "",
						message: "",
						additionalInfo: "",
					},
					null,
					null
				)
			).rejects.toThrow("Validation error");
		});
	});

	// ── redeemOffer ──────────────────────────────────────────────────────

	describe("redeemOffer", () => {
		it("sends offer data correctly", async () => {
			const formData = {
				firstName: "Jane",
				lastName: "Doe",
				phone: "206",
				email: "jane@example.com",
				couponDiscount: "20%",
				couponCondition: "First visit",
			};
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ success: true, emailStatus: "sent" }),
			});

			const result = await redeemOffer(formData, "tok");

			expect(fetch.mock.calls[0][0]).toBe("http://localhost:8001/api/redeem-offer");
			expect(result.success).toBe(true);
		});

		it("throws on failure", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				json: () => Promise.resolve({}),
			});

			await expect(redeemOffer({}, null)).rejects.toThrow("Failed to redeem offer");
		});
	});
});
