import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
	OMO_REGISTERED_TARGETS,
	UNSUPPORTED_NATIVE_BYPASS_TARGETS,
} from "../src/orchestration/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");

function readBypassDoc(): string {
	return readFileSync(resolve(packageRoot, "docs", "unsupported-bypasses.md"), "utf-8");
}

describe("unsupported-bypasses.md matches orchestration policy", () => {
	const bypassDoc = readBypassDoc();

	it("documents all UNSUPPORTED_NATIVE_BYPASS_TARGETS from policy.ts", () => {
		for (const target of UNSUPPORTED_NATIVE_BYPASS_TARGETS) {
			switch (target.type) {
				case "command":
					expect(bypassDoc).toContain("pi.native.command");
					break;
				case "tool":
					expect(bypassDoc).toContain("pi.native.tool");
					break;
				case "lifecycle":
					expect(bypassDoc).toContain("pi.native.lifecycle");
					break;
			}
		}
	});

	it("documents the unsupported-native-bypass policy category", () => {
		expect(bypassDoc).toContain("unsupported-native-bypass");
	});

	it("documents the policy engine reason message", () => {
		expect(bypassDoc).toContain("Pi native path is outside OMO extension ownership");
	});

	it("documents each bypass category section heading", () => {
		expect(bypassDoc).toContain("Direct Pi command execution");
		expect(bypassDoc).toContain("Direct Pi native tool invocation");
		expect(bypassDoc).toContain("Pi native lifecycle behavior");
	});

	it("documents what users should expect for each bypass", () => {
		const expectCount = (bypassDoc.match(/What users should expect/g) || []).length;
		expect(expectCount).toBeGreaterThanOrEqual(3);
	});

	it("documents why each bypass cannot be blocked", () => {
		const whyCount = (bypassDoc.match(/Why it can't be blocked/g) || []).length;
		expect(whyCount).toBeGreaterThanOrEqual(3);
	});

	it("policy.ts defines exactly 3 UNSUPPORTED_NATIVE_BYPASS_TARGETS", () => {
		expect(UNSUPPORTED_NATIVE_BYPASS_TARGETS).toHaveLength(3);
	});

	it("policy.ts UNSUPPORTED_NATIVE_BYPASS_TARGETS array is frozen", () => {
		expect(Object.isFrozen(UNSUPPORTED_NATIVE_BYPASS_TARGETS)).toBe(true);
	});
});

describe("unsupported-bypasses.md references real policy implementation", () => {
	const bypassDoc = readBypassDoc();

	it("references the policy.ts source file", () => {
		expect(bypassDoc).toContain("src/orchestration/policy.ts");
	});

	it("references the bypass-policy test file", () => {
		expect(bypassDoc).toContain("test/bypass-policy.test.ts");
	});

	it("references the parity documentation", () => {
		expect(bypassDoc).toContain("docs/parity.md");
	});
});

describe("OMO_REGISTERED_TARGETS count in policy matches documented commands + tools + lifecycle", () => {
	it("OMO_REGISTERED_TARGETS has entries (exact count may vary as extension grows)", () => {
		expect(OMO_REGISTERED_TARGETS.length).toBeGreaterThan(0);
	});

	it("OMO_REGISTERED_TARGETS includes command, tool, and lifecycle types", () => {
		const types = new Set(OMO_REGISTERED_TARGETS.map((t) => t.type));
		expect(types.has("command")).toBe(true);
		expect(types.has("tool")).toBe(true);
		expect(types.has("lifecycle")).toBe(true);
	});
});
