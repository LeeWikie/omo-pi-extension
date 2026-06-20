import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { route } from "../orchestration/index.js";

// ── Types ────────────────────────────────────────────────────────────────────

export interface Resource {
	/** Unique resource name (e.g. "skill-git-master", "prompt-publish") */
	name: string;
	/** Resource category: "skill", "prompt", or "asset" */
	type: "skill" | "prompt" | "asset";
	/** Path in the OMO source repository (for provenance) */
	sourcePath: string;
	/** Path relative to the extension package root */
	targetPath: string;
	/** Loaded file content (populated on demand) */
	content?: string;
	/** Optional notes about the resource */
	notes?: string;
}

export interface ManifestEntry {
	name: string;
	sourcePath: string;
	targetPath: string;
	type: "skill" | "prompt" | "asset";
	notes?: string;
}

export interface Manifest {
	version: string;
	generatedAt: string;
	sourceRepo: string;
	description: string;
	resources: ManifestEntry[];
}

// ── Path resolution ──────────────────────────────────────────────────────────

/** Resolve the package root directory (where resources/ lives) */
function packageRoot(): string {
	const dir = dirname(fileURLToPath(import.meta.url));
	// In dev: src/resources/ -> go up 2 levels to package root
	// In dist: dist/resources/ -> go up 2 levels to package root
	return resolve(dir, "..", "..");
}

// ── Manifest loading ─────────────────────────────────────────────────────────

let _manifest: Manifest | null = null;

function loadManifest(): Manifest {
	if (_manifest) return _manifest;

	const manifestPath = resolve(packageRoot(), "resources", "manifest.json");
	const raw = readFileSync(manifestPath, "utf-8");
	_manifest = JSON.parse(raw) as Manifest;
	return _manifest;
}

// ── Resource loading ─────────────────────────────────────────────────────────

/** Load the content of a resource file from disk */
function loadResourceContent(entry: ManifestEntry): string | undefined {
	const filePath = resolve(packageRoot(), entry.targetPath);
	if (!existsSync(filePath)) {
		return undefined;
	}
	return readFileSync(filePath, "utf-8");
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Get a single resource by name.
 * Returns `undefined` if the resource is not found.
 */
export function getResource(name: string): Resource | undefined {
	const manifest = loadManifest();
	const entry = manifest.resources.find((r) => r.name === name);
	if (!entry) return undefined;

	return {
		name: entry.name,
		type: entry.type,
		sourcePath: entry.sourcePath,
		targetPath: entry.targetPath,
		content: loadResourceContent(entry),
		notes: entry.notes,
	};
}

/**
 * List all available resources.
 * Content is NOT loaded by default to avoid eager I/O.
 */
export function listResources(): Resource[] {
	const manifest = loadManifest();
	return manifest.resources.map((entry) => ({
		name: entry.name,
		type: entry.type,
		sourcePath: entry.sourcePath,
		targetPath: entry.targetPath,
		notes: entry.notes,
	}));
}

/**
 * Register resource-related commands with the Pi extension API.
 *
 * Currently provides:
 * - `omo.resources.list` - lists all available resources
 * - `omo.resources.get` - gets a specific resource by name
 */
export function registerResources(pi: ExtensionAPI): void {
	pi.registerCommand("omo.resources.list", {
		description: "List all available OMO resources (skills, prompts, assets)",
		handler: async () => {
			const policyResult = await route({ type: "command", name: "omo.resources.list" });

			if (!policyResult.allowed) {
				return undefined;
			}

			const resources = listResources();
			const summary = resources
				.map((r) => `  [${r.type}] ${r.name} — ${r.notes ?? "no notes"}`)
				.join("\n");
			console.log(`OMO Resources (${resources.length} total):\n${summary}`);

			return undefined;
		},
	});

	pi.registerCommand("omo.resources.get", {
		description: "Get a specific OMO resource by name",
		handler: async (name?: string) => {
			const policyResult = await route({ type: "command", name: "omo.resources.get" });

			if (!policyResult.allowed) {
				return undefined;
			}

			if (!name) {
				console.log("Usage: omo.resources.get <resource-name>");
				return undefined;
			}
			const resource = getResource(name);
			if (!resource) {
				console.log(`Resource "${name}" not found.`);
				return undefined;
			}
			console.log(
				`Resource: ${resource.name} (${resource.type})\n` +
					`Source: ${resource.sourcePath}\n` +
					`Notes: ${resource.notes ?? "—"}\n` +
					`---\n${resource.content ?? "(content not available)"}`,
			);

			return undefined;
		},
	});
}
