import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { describe, expect, it, vi } from "vitest";
import { registerCommands } from "../src/commands/index.js";
import * as orchestration from "../src/orchestration/index.js";
import { createMockExtensionAPI } from "./helpers/mock-extension-api.js";

describe("command orchestration", () => {
	it("routes command handlers through the orchestration adapter", async () => {
		const pi = createMockExtensionAPI();
		const route = vi.spyOn(orchestration, "route").mockResolvedValue({ allowed: true });

		registerCommands(pi);

		const command = pi.getRegisteredCommands().find((registered) => registered.name === "omo:hyperplan");
		await command?.handler("build a plan", {} as ExtensionCommandContext);

		expect(route).toHaveBeenCalledWith({ type: "command", name: "omo:hyperplan" });
	});

	it("returns blocked orchestration results without running command stubs", async () => {
		const pi = createMockExtensionAPI();
		const blockedResult = { reason: "blocked by policy" };
		vi.spyOn(orchestration, "route").mockResolvedValue({
			allowed: false,
			result: blockedResult,
		});

		registerCommands(pi);

		const command = pi.getRegisteredCommands().find((registered) => registered.name === "omo:start-work");
		const result = await command?.handler("plan-a", {} as ExtensionCommandContext);

		expect(result).toBe(blockedResult);
	});
});
