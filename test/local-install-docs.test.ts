import { spawnSync } from "node:child_process";
import { accessSync, constants, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

describe("local Pi install documentation", () => {
	it("documents the local install workflow", () => {
		const docsPath = join(projectRoot, "docs/local-install.md");
		accessSync(docsPath, constants.R_OK);

		const docs = readFileSync(docsPath, "utf8");
		expect(docs).toContain("npm run local:install:pi");
		expect(docs).toContain("pi install -l --approve /root/openpi/omo-pi-extension");
		expect(docs).toContain("PI_OFFLINE=1 pi -e /root/openpi/omo-pi-extension --approve --help");
		expect(docs).toContain("npm run local:rollback");
	});

	it("ships executable local install scripts with valid shell syntax", () => {
		for (const script of ["local-install.sh", "local-rollback.sh", "verify-pi-load.sh"]) {
			const scriptPath = join(projectRoot, "scripts", script);
			accessSync(scriptPath, constants.R_OK | constants.X_OK);

			const result = spawnSync("bash", ["-n", scriptPath], {
				cwd: projectRoot,
				encoding: "utf8",
			});

			expect(result.status, result.stderr).toBe(0);
		}
	});

	it("exposes npm scripts for install, rollback, and verification", () => {
		const packageJson = JSON.parse(readFileSync(join(projectRoot, "package.json"), "utf8")) as {
			scripts?: Record<string, string>;
			pi?: { extensions?: string[] };
		};

		expect(packageJson.scripts).toMatchObject({
			"local:install:pi": "bash scripts/local-install.sh",
			"local:rollback": "bash scripts/local-rollback.sh",
			"verify:pi-load": "bash scripts/verify-pi-load.sh",
		});
		expect(packageJson.pi?.extensions).toEqual(["./dist/index.js"]);
	});
});
