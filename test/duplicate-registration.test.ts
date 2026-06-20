import { describe, expect, it } from "vitest";
import extension from "../src/index.js";
import { createMockExtensionAPI } from "./helpers/mock-extension-api.js";

describe("duplicate registration policy", () => {
	it("rejects duplicate command names during extension registration", async () => {
		const pi = createMockExtensionAPI();

		await extension(pi);

		const names = pi.getRegisteredCommands().map((command) => command.name);
		const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);

		expect(names.length).toBeGreaterThan(0);
		expect(duplicateNames).toEqual([]);
	});
});
