import { expect, test } from "@playwright/test";

async function stubCaptcha(page, token = "e2e-captcha-token") {
	await page.addInitScript((captchaToken) => {
		window.hcaptcha = {
			render: (_container, opts) => {
				window.__e2eCaptchaCallback = opts.callback;
				return 1;
			},
			reset: () => {},
			execute: () => {
				if (typeof window.__e2eCaptchaCallback === "function") {
					window.__e2eCaptchaCallback(captchaToken);
				}
			},
		};
	}, token);
}

test.describe("Frontend forms E2E", () => {
	test("schedule online submits successfully", async ({ page }) => {
		await stubCaptcha(page);
		let requestBody;
		await page.route("**/api/schedule", async (route) => {
			requestBody = route.request().postDataJSON();
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ success: true }),
			});
		});

		await page.goto("/schedule-online");
		await page.locator("#schedule-firstName").fill("Ada");
		await page.locator("#schedule-lastName").fill("Lovelace");
		await page.locator("#schedule-phone").fill("2065551234");
		await page.locator("#schedule-email").fill("ada@example.com");
		await page.locator("#schedule-message").fill("Need a quote for a leak repair");
		await page.getByRole("button", { name: "Submit Request" }).click();

		await expect(
			page.locator(".bg-green-100", { hasText: "Thank you! We'll be in touch soon." }),
		).toBeVisible();
		expect(requestBody.firstName).toBe("Ada");
		expect(requestBody.email).toBe("ada@example.com");
		expect(requestBody.captchaToken).toBe("e2e-captcha-token");
	});

	test("careers form submits with resume", async ({ page }) => {
		await stubCaptcha(page);
		let formDataSnapshot;
		await page.route("**/api/job-application", async (route) => {
			const postData = route.request().postDataBuffer();
			formDataSnapshot = postData?.toString("utf-8") || "";
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ success: true }),
			});
		});

		await page.goto("/careers");
		await page.locator("#job-firstName").fill("Grace");
		await page.locator("#job-lastName").fill("Hopper");
		await page.locator("#job-phone").fill("2065559876");
		await page.locator("#job-email").fill("grace@example.com");
		await page.locator("text=Select a position").click();
		await page.locator("li", { hasText: "Licensed Residential Plumber" }).click();
		await page.setInputFiles("#job-resume", {
			name: "resume.pdf",
			mimeType: "application/pdf",
			buffer: Buffer.from("fake resume"),
		});
		await page.getByRole("button", { name: "Apply Now" }).click();

		await expect(page.getByText("Thank you! We'll be in touch soon.")).toBeVisible();
		expect(formDataSnapshot).toContain("name=\"firstName\"");
		expect(formDataSnapshot).toContain("Grace");
		expect(formDataSnapshot).toContain("name=\"captchaToken\"");
		expect(formDataSnapshot).toContain("e2e-captcha-token");
	});

	test("coupon modal submits redeem request", async ({ page }) => {
		await stubCaptcha(page);
		let requestBody;
		await page.route("**/api/redeem-offer", async (route) => {
			requestBody = route.request().postDataJSON();
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ success: true }),
			});
		});

		await page.goto("/coupons");
		await page.getByRole("button", { name: "Redeem Offer" }).first().click();
		await expect(page.getByText("Redeem Offer:")).toBeVisible();
		await page.locator("#offer-firstName").fill("Margaret");
		await page.locator("#offer-lastName").fill("Hamilton");
		await page.locator("#offer-email").fill("margaret@example.com");
		await page.locator("#offer-phone").fill("2065554444");
		await page.getByRole("button", { name: "Submit Request" }).click();

		await expect(page.getByText("Thank you! We'll be in touch soon.")).toBeVisible();
		expect(requestBody.firstName).toBe("Margaret");
		expect(requestBody.couponDiscount).toContain("OFF");
		expect(requestBody.captchaToken).toBe("e2e-captcha-token");
	});
});
