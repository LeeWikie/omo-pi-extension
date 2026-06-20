import { Type } from "@sinclair/typebox";
import { describe, expect, it } from "vitest";
import extension from "../src/index.js";
import { createMockExtensionAPI } from "./helpers/mock-extension-api.js";

describe("extension registration", () => {
	it("exports an extension factory function", () => {
		expect(typeof extension).toBe("function");
	});

	it("calls the extension factory with the mock API without errors", async () => {
		const pi = createMockExtensionAPI();

		await expect(Promise.resolve(extension(pi))).resolves.toBeUndefined();
	});

	it("returns registered commands as an array", () => {
		const pi = createMockExtensionAPI();

		expect(pi.getRegisteredCommands()).toEqual([]);
		expect(Array.isArray(pi.getRegisteredCommands())).toBe(true);
	});

	it("records command, tool, shortcut, flag, and event registrations", () => {
		const pi = createMockExtensionAPI();
		const parameters = Type.Object({ prompt: Type.String() });

		pi.registerCommand("omo.run", {
			description: "Run OhMyOpenCode",
			handler: () => undefined,
		});
		pi.registerTool({
			name: "omo_tool",
			description: "Run an OMO tool",
			parameters,
			execute: () => ({ ok: true }),
		});
		pi.registerShortcut("ctrl+o", {
			description: "Open OMO",
			handler: () => undefined,
		});
		pi.registerFlag("omo-enabled", { type: "boolean", default: false });
		pi.on("session_start", () => undefined);

		expect(pi.getRegisteredCommands()).toMatchObject([{ name: "omo.run", description: "Run OhMyOpenCode" }]);
		expect(pi.getRegisteredTools()).toMatchObject([{ name: "omo_tool", parameters }]);
		expect(pi.getRegisteredShortcuts()).toMatchObject([{ keyId: "ctrl+o", description: "Open OMO" }]);
		expect(pi.getRegisteredFlags()).toMatchObject([{ name: "omo-enabled", type: "boolean", default: false }]);
		expect(pi.getRegisteredEvents()).toMatchObject([{ event: "session_start" }]);
	});
});
