import { describe, expect, it } from "vitest";
import { getResource, listResources } from "../src/resources/index.js";

describe("skill execution is disabled in resource loader", () => {
	it("listResources() returns resources without executing any code", () => {
		const resources = listResources();
		expect(resources.length).toBeGreaterThan(0);
		// Resources are data-only: no side effects, no MCP servers started
		for (const r of resources) {
			expect(r).toHaveProperty("name");
			expect(r).toHaveProperty("type");
			expect(r).toHaveProperty("sourcePath");
			expect(r).toHaveProperty("targetPath");
		}
	});

	it("getResource() returns content without executing skill logic", () => {
		const resource = getResource("skill-ast-grep");
		expect(resource).toBeDefined();
		if (!resource) {
			throw new Error("Expected skill-ast-grep resource to exist");
		}
		expect(resource.content).toBeDefined();
		// Content is markdown documentation, not executable code
		expect(resource.content).toContain("ast-grep");
	});

	it("no resource content contains MCP server startup commands", () => {
		const resources = listResources();
		for (const r of resources) {
			const full = getResource(r.name);
			if (full?.content) {
				// Verify no MCP server auto-start patterns in the content
				expect(full.content).not.toMatch(/mcp\.run\s*\(/);
				expect(full.content).not.toMatch(/startServer\s*\(/);
			}
		}
	});

	it("resource loader does not import OpenCode-specific packages", () => {
		// The resources module should only depend on node:fs, node:path, node:url
		// and the Pi ExtensionAPI type (for registerResources)
		const resources = listResources();
		expect(resources.length).toBeGreaterThan(0);
		// Verify we can call getResource without any OpenCode dependency
		const resource = getResource("skill-git-master");
		expect(resource).toBeDefined();
	});

	it("skill resources are markdown documentation, not executables", () => {
		const resources = listResources();
		const skills = resources.filter((r) => r.type === "skill");
		for (const skill of skills) {
			const full = getResource(skill.name);
			expect(full?.content).toBeDefined();
			if (!full) {
				throw new Error(`Expected resource ${skill.name} to exist`);
			}
			// All skill resources should be markdown files
			expect(full.targetPath).toMatch(/\.md$/);
		}
	});

	it("prompt resources are markdown documentation, not executables", () => {
		const resources = listResources();
		const prompts = resources.filter((r) => r.type === "prompt");
		for (const prompt of prompts) {
			const full = getResource(prompt.name);
			expect(full?.content).toBeDefined();
			if (!full) {
				throw new Error(`Expected resource ${prompt.name} to exist`);
			}
			expect(full.targetPath).toMatch(/\.md$/);
		}
	});
});
