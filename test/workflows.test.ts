import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { describe, expect, it, vi } from "vitest";
import extension from "../src/index.js";
import * as orchestration from "../src/orchestration/index.js";
import { registerWorkflows } from "../src/workflows/index.js";
import { createMockExtensionAPI } from "./helpers/mock-extension-api.js";

describe("OMO workflow adapters", () => {
	it("registers supported workflow commands", async () => {
		const pi = createMockExtensionAPI();

		await extension(pi);

		expect(pi.getRegisteredCommands()).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					name: "omo:workflow:ultrawork",
					description: "Execute the OMO ultrawork workflow",
				}),
				expect.objectContaining({
					name: "omo:workflow:plan-execute",
					description: "Execute the OMO plan to execution workflow",
				}),
			]),
		);
	});

	it("executes ultrawork workflow steps in order", async () => {
		const pi = createMockExtensionAPI();
		const route = vi.spyOn(orchestration, "route").mockResolvedValue({
			allowed: true,
			category: "handled-by-omo",
		});

		registerWorkflows(pi);

		const command = pi.getRegisteredCommands().find((registered) => registered.name === "omo:workflow:ultrawork");
		const result = await command?.handler("", {} as ExtensionCommandContext);

		expect(route.mock.calls.map(([target]) => target)).toEqual([
			{ type: "command", name: "omo:workflow:ultrawork" },
			{ type: "command", name: "omo:ultrawork" },
			{ type: "lifecycle", event: "before_agent_start" },
			{ type: "lifecycle", event: "tool_call" },
			{ type: "lifecycle", event: "message_end" },
			{ type: "tool", name: "omo-read-project-state" },
		]);
		expect(result).toMatchObject({
			allowed: true,
			category: "handled-by-omo",
			workflow: "omo:workflow:ultrawork",
		});
	});

	it("executes plan-execute workflow steps in order", async () => {
		const pi = createMockExtensionAPI();
		const route = vi.spyOn(orchestration, "route").mockResolvedValue({
			allowed: true,
			category: "handled-by-omo",
		});

		registerWorkflows(pi);

		const command = pi.getRegisteredCommands().find((registered) => registered.name === "omo:workflow:plan-execute");
		await command?.handler("", {} as ExtensionCommandContext);

		expect(route.mock.calls.map(([target]) => target)).toEqual([
			{ type: "command", name: "omo:workflow:plan-execute" },
			{ type: "command", name: "omo:hyperplan" },
			{ type: "command", name: "omo:start-work" },
			{ type: "lifecycle", event: "session_shutdown" },
		]);
	});
});
