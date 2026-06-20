import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = new URL("..", import.meta.url).pathname;
const matrixPath = join(projectRoot, "docs/lifecycle-matrix.md");

describe("lifecycle matrix", () => {
	it("documents supported OMO lifecycle mappings to Pi events", () => {
		expect(existsSync(matrixPath)).toBe(true);

		const matrix = readFileSync(matrixPath, "utf-8");

		expect(matrix).toContain("before_agent_start");
		expect(matrix).toContain("tool_call");
		expect(matrix).toContain("message_end");
		expect(matrix).toContain("input");
		expect(matrix).toContain("session_start");
		expect(matrix).toContain("session_shutdown");
	});

	it("identifies unsupported Pi lifecycle gaps", () => {
		const matrix = readFileSync(matrixPath, "utf-8");

		expect(matrix).toContain("Unsupported");
		expect(matrix).toContain("OpenCode config and plugin composition hooks");
		expect(matrix).toContain("Claude Code hook command execution bridge");
		expect(matrix).toContain("Autonomous continuation loops and background task lifecycle");
	});
});
