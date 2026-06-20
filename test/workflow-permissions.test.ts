import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { describe, expect, it, vi } from "vitest";
import * as orchestration from "../src/orchestration/index.js";
import { registerWorkflows } from "../src/workflows/index.js";
import { createMockExtensionAPI } from "./helpers/mock-extension-api.js";

describe("workflow permissions", () => {
	it("fails closed when the workflow command is denied", async () => {
		const pi = createMockExtensionAPI();
		const blockedPolicy = {
			allowed: false,
			category: "requires-future-core-api" as const,
			reason: "workflow command not registered",
		};
		const route = vi.spyOn(orchestration, "route").mockResolvedValue(blockedPolicy);

		registerWorkflows(pi);

		const command = pi.getRegisteredCommands().find((registered) => registered.name === "omo:workflow:ultrawork");
		const result = await command?.handler("", {} as ExtensionCommandContext);

		expect(result).toBe(blockedPolicy);
		expect(route).toHaveBeenCalledTimes(1);
		expect(route).toHaveBeenCalledWith({ type: "command", name: "omo:workflow:ultrawork" });
	});

	it("fails closed when a required workflow step is denied", async () => {
		const pi = createMockExtensionAPI();
		const blockedPolicy = {
			allowed: false,
			category: "blocked-high-risk" as const,
			reason: "required permission not granted",
		};
		const route = vi
			.spyOn(orchestration, "route")
			.mockResolvedValueOnce({ allowed: true, category: "handled-by-omo" })
			.mockResolvedValueOnce({ allowed: true, category: "handled-by-omo" })
			.mockResolvedValueOnce(blockedPolicy);

		registerWorkflows(pi);

		const command = pi.getRegisteredCommands().find((registered) => registered.name === "omo:workflow:plan-execute");
		const result = await command?.handler("", {} as ExtensionCommandContext);

		expect(result).toBe(blockedPolicy);
		expect(route.mock.calls.map(([target]) => target)).toEqual([
			{ type: "command", name: "omo:workflow:plan-execute" },
			{ type: "command", name: "omo:hyperplan" },
			{ type: "command", name: "omo:start-work" },
		]);
	});
});
