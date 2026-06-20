import { describe, expect, it } from "vitest";
import extension from "../src/index.js";
import { route } from "../src/orchestration/index.js";
import { createMockExtensionAPI } from "./helpers/mock-extension-api.js";

describe("orchestration routing", () => {
	it("routes registered OMO commands as handled by OMO", async () => {
		await expect(route({ type: "command", name: "omo:ultrawork" })).resolves.toMatchObject({
			allowed: true,
			category: "handled-by-omo",
		});
	});

	it("classifies unknown targets as requiring future Pi core API support", async () => {
		await expect(route({ type: "command", name: "pi.unknown" })).resolves.toMatchObject({
			allowed: false,
			category: "requires-future-core-api",
		});
	});

	it("routes registered command handlers through orchestration", async () => {
		const pi = createMockExtensionAPI();

		await extension(pi);

		const configCommand = pi.getRegisteredCommands().find((command) => command.name === "omo.config");

		const result = await configCommand?.handler("", { hasUI: false, ui: { notify: () => {} } });
		expect(result).toMatchObject({
			command: "omo.config",
			status: "routed",
		});
	});
});
