import { execFileSync } from "node:child_process";
import { expect, test } from "@playwright/test";

async function stubCaptcha(page, token = "full-stack-smoke-captcha-token") {
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

const composeFile = process.env.SMOKE_COMPOSE_FILE;
const composeProject = process.env.SMOKE_COMPOSE_PROJECT;

function sqlLiteral(value) {
	return `'${String(value).replaceAll("'", "''")}'`;
}

function runPostgres(sql) {
	if (!composeFile || !composeProject) {
		throw new Error("SMOKE_COMPOSE_FILE and SMOKE_COMPOSE_PROJECT are required.");
	}

	return execFileSync(
		"docker",
		[
			"compose",
			"-f",
			composeFile,
			"-p",
			composeProject,
			"exec",
			"-T",
			"db",
			"psql",
			"-U",
			"postgres",
			"-d",
			"pspah",
			"-t",
			"-A",
			"-c",
			sql,
		],
		{ encoding: "utf8" },
	).trim();
}

test.describe("Full-stack smoke", () => {
	test.skip(
		process.env.FULL_STACK_SMOKE !== "true",
		"Run with `npm run test:e2e:full-stack` to start Docker Postgres and FastAPI.",
	);

	test("submits the default DIY permit path through the UI, FastAPI, and Docker Postgres", async ({ page }) => {
		await stubCaptcha(page);

		const uniqueId = Date.now();
		const email = `full-stack-diy-${uniqueId}@example.com`;
		const address = `${uniqueId} Smoke Test Ave`;

		runPostgres(
			`DELETE FROM "DIY Permit Requests" WHERE email = ${sqlLiteral(email)}`,
		);

		try {
			await page.goto("/resources");
			await page.locator("#diy-firstName").fill("Fullstack");
			await page.locator("#diy-lastName").fill("Smoke");
			await page.locator("#diy-email").fill(email);
			await page.locator("#diy-phone").fill("2065550101");
			await page.locator("#diy-address").fill(address);
			await page.locator("#diy-city").fill("Seattle");
			await page.locator("#diy-state").fill("WA");
			await page.locator("#diy-zipCode").fill("98101");
			await page.locator("#diy-projectDescription").fill("Default inspection smoke test");

			// Leave #diy-inspection unchanged to cover the default `unsure` path.
			await expect(page.locator("#diy-inspection")).toHaveValue("unsure");
			await page.getByRole("button", { name: "Submit Request" }).click();

			await expect(page.getByText("Thank you! We'll be in touch soon.")).toBeVisible();

			const persistedInspection = runPostgres(
				`SELECT inspection FROM "DIY Permit Requests" WHERE email = ${sqlLiteral(email)} AND address = ${sqlLiteral(address)} ORDER BY id DESC LIMIT 1`,
			);
			expect(persistedInspection).toBe("unsure");
		} finally {
			runPostgres(
				`DELETE FROM "DIY Permit Requests" WHERE email = ${sqlLiteral(email)}`,
			);
		}
	});
});
