import { describe, expect, it } from "vitest";
import extension from "../src/index.js";
import { createMockExtensionAPI } from "./helpers/mock-extension-api.js";

const commandExpectations = [
	{
		name: "omo:ultrawork",
		description: "Start ultrawork autonomous loop",
		argumentHint: '"task description" [--completion-promise=TEXT] [--strategy=reset|continue]',
	},
	{
		name: "omo-ultrawork",
		description: "Start ultrawork autonomous loop",
		argumentHint: '"task description" [--completion-promise=TEXT] [--strategy=reset|continue]',
	},
	{
		name: "omo:ulw",
		description: "Start ultrawork autonomous loop",
		argumentHint: '"task description" [--completion-promise=TEXT] [--strategy=reset|continue]',
	},
	{
		name: "omo-ulw",
		description: "Start ultrawork autonomous loop",
		argumentHint: '"task description" [--completion-promise=TEXT] [--strategy=reset|continue]',
	},
	{
		name: "omo:hyperplan",
		description: "Adversarial multi-agent planning via team-mode",
		argumentHint: "[planning-request]",
	},
	{
		name: "omo-hyperplan",
		description: "Adversarial multi-agent planning via team-mode",
		argumentHint: "[planning-request]",
	},
	{
		name: "omo:init-deep",
		description: "Initialize hierarchical AGENTS.md knowledge base",
		argumentHint: "[--create-new] [--max-depth=N]",
	},
	{
		name: "omo-init-deep",
		description: "Initialize hierarchical AGENTS.md knowledge base",
		argumentHint: "[--create-new] [--max-depth=N]",
	},
	{
		name: "omo:handoff",
		description: "Create a detailed context summary for continuing work in a new session",
		argumentHint: "[goal]",
	},
	{
		name: "omo-handoff",
		description: "Create a detailed context summary for continuing work in a new session",
		argumentHint: "[goal]",
	},
	{
		name: "omo:start-work",
		description: "Start Sisyphus work session from Prometheus plan",
		argumentHint: "[plan-name] [--worktree <path>]",
	},
	{
		name: "omo-start-work",
		description: "Start Sisyphus work session from Prometheus plan",
		argumentHint: "[plan-name] [--worktree <path>]",
	},
];

describe("OMO command adapters", () => {
	it("registers every Pi-adapted OMO command once", async () => {
		const pi = createMockExtensionAPI();

		await extension(pi);

		const commands = pi.getRegisteredCommands();
		const commandNames = commands.map((command) => command.name);

		for (const expected of commandExpectations) {
			expect(commandNames.filter((name) => name === expected.name)).toHaveLength(1);
			expect(commands.find((command) => command.name === expected.name)).toMatchObject({
				name: expected.name,
				description: expected.description,
			});
		}
	});

	it("preserves argument hints and static flag completions", async () => {
		const pi = createMockExtensionAPI();

		await extension(pi);

		for (const expected of commandExpectations) {
			const command = pi.getRegisteredCommands().find((registered) => registered.name === expected.name);

			expect(command?.definition.argumentHint).toBe(expected.argumentHint);
			expect(command?.getArgumentCompletions).toBeTypeOf("function");
		}

		const initDeep = pi.getRegisteredCommands().find((command) => command.name === "omo:init-deep");
		expect(await initDeep?.getArgumentCompletions?.("--")).toEqual([
			{ value: "--create-new", label: "--create-new" },
			{ value: "--max-depth=", label: "--max-depth=N" },
		]);
	});
});
