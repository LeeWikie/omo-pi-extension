import { describe, expect, it, vi } from "vitest";
import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import * as orchestration from "../src/orchestration/index.js";

// Mock orchestration route to control allowed/blocked responses
vi.mock("../src/orchestration/index.js", () => ({
	route: vi.fn(),
}));

// Import the handlers via the extension registration
import extension from "../src/index.js";
import { createMockExtensionAPI } from "./helpers/mock-extension-api.js";

function makeMockContext(hasUI: boolean): ExtensionCommandContext {
	const notify = vi.fn();
	return {
		hasUI,
		ui: { notify },
	} as unknown as ExtensionCommandContext;
}

describe("command handler feedback", () => {
	it("calls ctx.ui.notify with 'info' when command is allowed and hasUI is true", async () => {
		vi.mocked(orchestration.route).mockResolvedValue({
			allowed: true,
			category: "handled-by-omo",
		});

		const pi = createMockExtensionAPI();
		await extension(pi);

		const ctx = makeMockContext(true);
		const cmd = pi.getRegisteredCommands().find((c) => c.name === "omo:ultrawork");
		expect(cmd).toBeDefined();

		await cmd!.handler("test task", ctx);

		expect(ctx.ui.notify).toHaveBeenCalledWith(
			expect.stringContaining("omo:ultrawork"),
			"info",
		);
	});

	it("calls ctx.ui.notify with 'warning' when command is blocked and hasUI is true", async () => {
		vi.mocked(orchestration.route).mockResolvedValue({
			allowed: false,
			category: "blocked-high-risk",
			reason: "permission denied",
		});

		const pi = createMockExtensionAPI();
		await extension(pi);

		const ctx = makeMockContext(true);
		const cmd = pi.getRegisteredCommands().find((c) => c.name === "omo:ultrawork");
		expect(cmd).toBeDefined();

		await cmd!.handler("test task", ctx);

		expect(ctx.ui.notify).toHaveBeenCalledWith(
			expect.stringContaining("blocked"),
			"warning",
		);
	});

	it("does not call ctx.ui.notify when hasUI is false", async () => {
		vi.mocked(orchestration.route).mockResolvedValue({
			allowed: true,
			category: "handled-by-omo",
		});

		const pi = createMockExtensionAPI();
		await extension(pi);

		const ctx = makeMockContext(false);
		const cmd = pi.getRegisteredCommands().find((c) => c.name === "omo:ultrawork");
		expect(cmd).toBeDefined();

		await cmd!.handler("test task", ctx);

		expect(ctx.ui.notify).not.toHaveBeenCalled();
	});

	it("returns a meaningful result object when allowed", async () => {
		vi.mocked(orchestration.route).mockResolvedValue({
			allowed: true,
			category: "handled-by-omo",
		});

		const pi = createMockExtensionAPI();
		await extension(pi);

		const ctx = makeMockContext(false);
		const cmd = pi.getRegisteredCommands().find((c) => c.name === "omo:ultrawork");
		expect(cmd).toBeDefined();

		const result = await cmd!.handler("test args", ctx);

		expect(result).toEqual({
			command: "omo:ultrawork",
			args: "test args",
			status: "routed",
			message: expect.stringContaining("omo:ultrawork"),
		});
	});

	it("returns policy.result when blocked", async () => {
		vi.mocked(orchestration.route).mockResolvedValue({
			allowed: false,
			category: "blocked-high-risk",
			result: { blocked: true },
		});

		const pi = createMockExtensionAPI();
		await extension(pi);

		const ctx = makeMockContext(false);
		const cmd = pi.getRegisteredCommands().find((c) => c.name === "omo:ultrawork");
		expect(cmd).toBeDefined();

		const result = await cmd!.handler("test args", ctx);

		expect(result).toEqual({ blocked: true });
	});

	it("dash-style aliases also call notify when allowed", async () => {
		vi.mocked(orchestration.route).mockResolvedValue({
			allowed: true,
			category: "handled-by-omo",
		});

		const pi = createMockExtensionAPI();
		await extension(pi);

		const ctx = makeMockContext(true);
		const cmd = pi.getRegisteredCommands().find((c) => c.name === "omo-ultrawork");
		expect(cmd).toBeDefined();

		await cmd!.handler("", ctx);

		expect(ctx.ui.notify).toHaveBeenCalledWith(
			expect.stringContaining("omo-ultrawork"),
			"info",
		);
	});
});
