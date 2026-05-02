import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.resolve(__dirname, "..");
const repoRoot = path.resolve(clientDir, "..");
const composeFile = path.join(repoRoot, "docker-compose.full-stack-smoke.yml");
const composeProject = process.env.SMOKE_COMPOSE_PROJECT || "pspah-full-stack-smoke";
const apiBaseUrl = process.env.SMOKE_API_BASE_URL || "http://127.0.0.1:8000";
const frontendPort = process.env.SMOKE_FRONTEND_PORT || "4173";

const composeArgs = (...args) => [
	"compose",
	"-f",
	composeFile,
	"-p",
	composeProject,
	...args,
];

function run(command, args, options = {}) {
	const result = spawnSync(command, args, {
		cwd: options.cwd || repoRoot,
		stdio: options.stdio || "inherit",
		env: { ...process.env, ...options.env },
	});

	if (result.error) {
		throw result.error;
	}

	if (result.status !== 0) {
		throw new Error(`${command} ${args.join(" ")} exited with ${result.status}`);
	}

	return result;
}

async function waitForReady() {
	const deadline = Date.now() + 120_000;
	let lastError = "backend did not respond";

	while (Date.now() < deadline) {
		try {
			const response = await fetch(`${apiBaseUrl}/health/ready`);
			if (response.ok) {
				return;
			}
			lastError = `${response.status} ${await response.text()}`;
		} catch (error) {
			lastError = error instanceof Error ? error.message : String(error);
		}
		await new Promise((resolve) => setTimeout(resolve, 1_000));
	}

	throw new Error(`Timed out waiting for ${apiBaseUrl}/health/ready: ${lastError}`);
}

let exitCode = 0;
try {
	run("docker", composeArgs("up", "--build", "-d", "db", "server"));
	await waitForReady();

	run(
		"npx",
		["playwright", "test", "e2e/full-stack-smoke.e2e.spec.js"],
		{
			cwd: clientDir,
			env: {
				FULL_STACK_SMOKE: "true",
				SMOKE_COMPOSE_FILE: composeFile,
				SMOKE_COMPOSE_PROJECT: composeProject,
				VITE_API_BASE_URL: apiBaseUrl,
				VITE_HCAPTCHA_SITE_KEY: "10000000-0000-0000-0000-000000000001",
				VITE_SITE_URL: `http://127.0.0.1:${frontendPort}`,
			},
		},
	);
} catch (error) {
	exitCode = 1;
	console.error(error instanceof Error ? error.message : error);
	try {
		run("docker", composeArgs("logs", "--no-color", "server"), { stdio: "inherit" });
	} catch {
		// The original error is more useful than a log collection failure.
	}
} finally {
	if (process.env.KEEP_FULL_STACK_SMOKE_STACK !== "true") {
		try {
			run("docker", composeArgs("down", "-v", "--remove-orphans"));
		} catch (error) {
			console.error(error instanceof Error ? error.message : error);
			exitCode = 1;
		}
	}
}

process.exit(exitCode);
