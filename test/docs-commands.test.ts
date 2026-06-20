import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");

function readPackageJson(): Record<string, unknown> {
	return JSON.parse(readFileSync(resolve(packageRoot, "package.json"), "utf-8"));
}

function readReadme(): string {
	return readFileSync(resolve(packageRoot, "README.md"), "utf-8");
}

function readLocalInstallDocs(): string {
	return readFileSync(resolve(packageRoot, "docs", "local-install.md"), "utf-8");
}

describe("docs reference real npm scripts", () => {
	const pkg = readPackageJson();
	const scripts = (pkg.scripts as Record<string, string>) ?? {};
	const readme = readReadme();
	const localInstall = readLocalInstallDocs();

	const realScriptNames = Object.keys(scripts);

	it("README references npm install", () => {
		expect(readme).toContain("npm install");
	});

	it("README references npm run build", () => {
		expect(readme).toContain("npm run build");
	});

	it("README references npm test", () => {
		expect(readme).toContain("npm test");
	});

	it("README references npm run typecheck", () => {
		expect(readme).toContain("npm run typecheck");
	});

	it("README references npm run local:install:pi", () => {
		expect(readme).toContain("npm run local:install:pi");
	});

	it("local-install.md references npm install", () => {
		expect(localInstall).toContain("npm install");
	});

	it("local-install.md references npm run build", () => {
		expect(localInstall).toContain("npm run build");
	});

	it("local-install.md references npm run local:install:pi", () => {
		expect(localInstall).toContain("npm run local:install:pi");
	});

	it("local-install.md references npm run verify:pi-load", () => {
		expect(localInstall).toContain("npm run verify:pi-load");
	});

	it("every npm script referenced in README exists in package.json", () => {
		const readmeScriptRefs = extractNpmScriptRefs(readme);
		for (const ref of readmeScriptRefs) {
			expect(realScriptNames).toContain(ref);
		}
	});

	it("every npm script referenced in local-install.md exists in package.json", () => {
		const installScriptRefs = extractNpmScriptRefs(localInstall);
		for (const ref of installScriptRefs) {
			expect(realScriptNames).toContain(ref);
		}
	});
});

describe("docs reference real documentation files", () => {
	const readme = readReadme();

	it("README links to local-install.md", () => {
		expect(readme).toContain("docs/local-install.md");
	});

	it("README links to security.md", () => {
		expect(readme).toContain("docs/security.md");
	});

	it("README links to migration-matrix.md", () => {
		expect(readme).toContain("docs/migration-matrix.md");
	});

	it("README links to lifecycle-matrix.md", () => {
		expect(readme).toContain("docs/lifecycle-matrix.md");
	});

	it("README links to parity.md", () => {
		expect(readme).toContain("docs/parity.md");
	});

	it("README links to unsupported-bypasses.md", () => {
		expect(readme).toContain("docs/unsupported-bypasses.md");
	});

	it("all linked docs exist on disk", () => {
		const docLinks = extractDocLinks(readme);
		for (const link of docLinks) {
			const fullPath = resolve(packageRoot, link);
			expect(() => readFileSync(fullPath, "utf-8")).not.toThrow();
		}
	});
});

function extractNpmScriptRefs(text: string): string[] {
	const refs: string[] = [];
	const regex = /npm run ([\w:-]+)/g;

	for (const match of text.matchAll(regex)) {
		const scriptName = match[1];
		if (!refs.includes(scriptName)) {
			refs.push(scriptName);
		}
	}

	return refs;
}

function extractDocLinks(text: string): string[] {
	const links: string[] = [];
	const regex = /docs\/[\w.-]+\.md/g;

	for (const match of text.matchAll(regex)) {
		if (!links.includes(match[0])) {
			links.push(match[0]);
		}
	}

	return links;
}
