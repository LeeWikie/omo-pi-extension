import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getResource, listResources } from "../src/resources/index.js";

const PACKAGE_ROOT = resolve(import.meta.dirname, "..");

describe("resource manifest", () => {
	const manifestPath = resolve(PACKAGE_ROOT, "resources", "manifest.json");

	it("manifest.json exists and is valid JSON", () => {
		expect(existsSync(manifestPath)).toBe(true);
		const raw = readFileSync(manifestPath, "utf-8");
		const manifest = JSON.parse(raw);
		expect(manifest).toHaveProperty("version");
		expect(manifest).toHaveProperty("resources");
		expect(Array.isArray(manifest.resources)).toBe(true);
	});

	it("manifest lists at least 20 resources", () => {
		const raw = readFileSync(manifestPath, "utf-8");
		const manifest = JSON.parse(raw);
		expect(manifest.resources.length).toBeGreaterThanOrEqual(20);
	});

	it("every manifest entry has required fields", () => {
		const raw = readFileSync(manifestPath, "utf-8");
		const manifest = JSON.parse(raw);
		for (const entry of manifest.resources) {
			expect(entry).toHaveProperty("name");
			expect(entry).toHaveProperty("sourcePath");
			expect(entry).toHaveProperty("targetPath");
			expect(entry).toHaveProperty("type");
			expect(["skill", "prompt", "asset"]).toContain(entry.type);
		}
	});

	it("every manifest targetPath points to an existing file", () => {
		const raw = readFileSync(manifestPath, "utf-8");
		const manifest = JSON.parse(raw);
		for (const entry of manifest.resources) {
			const fullPath = resolve(PACKAGE_ROOT, entry.targetPath);
			expect(existsSync(fullPath), `Missing: ${entry.targetPath}`).toBe(true);
		}
	});
});

describe("resource loader", () => {
	it("listResources() returns all resources from manifest", () => {
		const resources = listResources();
		expect(resources.length).toBeGreaterThanOrEqual(20);
		for (const r of resources) {
			expect(r).toHaveProperty("name");
			expect(r).toHaveProperty("type");
			expect(r).toHaveProperty("sourcePath");
			expect(r).toHaveProperty("targetPath");
		}
	});

	it("listResources() does not eagerly load content", () => {
		const resources = listResources();
		for (const r of resources) {
			expect(r.content).toBeUndefined();
		}
	});

	it("getResource() returns undefined for unknown name", () => {
		expect(getResource("nonexistent-resource")).toBeUndefined();
	});

	it("getResource() returns resource with content for known names", () => {
		const resource = getResource("skill-git-master");
		expect(resource).toBeDefined();
		if (!resource?.content) {
			throw new Error("Expected skill-git-master resource with content");
		}
		expect(resource.name).toBe("skill-git-master");
		expect(resource.type).toBe("skill");
		expect(resource.content.length).toBeGreaterThan(0);
		expect(resource.content).toContain("Git Master");
	});

	it("getResource() loads prompt resources correctly", () => {
		const resource = getResource("prompt-publish");
		expect(resource).toBeDefined();
		if (!resource?.content) {
			throw new Error("Expected prompt-publish resource with content");
		}
		expect(resource.type).toBe("prompt");
		expect(resource.content.length).toBeGreaterThan(0);
	});

	it("getResource() returns all skill resources", () => {
		const resources = listResources();
		const skills = resources.filter((r) => r.type === "skill");
		expect(skills.length).toBeGreaterThanOrEqual(17);
	});

	it("getResource() returns all prompt resources", () => {
		const resources = listResources();
		const prompts = resources.filter((r) => r.type === "prompt");
		expect(prompts.length).toBeGreaterThanOrEqual(5);
	});
});
