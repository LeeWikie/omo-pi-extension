import { beforeEach, describe, expect, it, vi } from "vitest";
import { PermissionClass } from "../src/security/permission-classes.js";
import { registerTools } from "../src/tools/index.js";
import { createMockExtensionAPI } from "./helpers/mock-extension-api.js";

const routeState = vi.hoisted(() => ({
	allowedTools: new Set<string>(),
}));

vi.mock("../src/orchestration/index.js", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../src/orchestration/index.js")>();

	return {
		...actual,
		route: vi.fn(async (target) => {
			if (target.type === "tool" && routeState.allowedTools.has(target.name)) {
				return { allowed: true, category: "handled-by-omo" };
			}

			return actual.route(target);
		}),
	};
});

describe("high-risk tool policy", () => {
	beforeEach(() => {
		routeState.allowedTools.clear();
	});

	it.each([
		["omo-run-project-command", PermissionClass.ProcessSpawn],
		["omo-fetch-release-metadata", PermissionClass.Network],
		["omo-write-global-settings", PermissionClass.GlobalConfig],
		["omo-start-background-session", PermissionClass.LongLivedProcess],
	])("blocks %s without its required permission", async (toolName, requiredPermission) => {
		const pi = createMockExtensionAPI();
		registerTools(pi);

		const tool = pi.getRegisteredTools().find((registeredTool) => registeredTool.name === toolName);

		await expect(Promise.resolve(tool?.execute())).resolves.toMatchObject({
			details: {
				blocked: true,
				reason: `Permission ${requiredPermission} not granted`,
			},
		});
	});

	it("reports restricted adapters as recognized but not yet implemented after permission is granted", async () => {
		const pi = createMockExtensionAPI();
		routeState.allowedTools.add("omo-run-project-command");
		registerTools(pi);

		const tool = pi.getRegisteredTools().find((registeredTool) => registeredTool.name === "omo-run-project-command");

		await expect(Promise.resolve(tool?.execute())).resolves.toMatchObject({
			details: {
				tool: "omo-run-project-command",
				implemented: false,
				reason: expect.stringContaining("needs a safe implementation"),
			},
		});
	});
});
