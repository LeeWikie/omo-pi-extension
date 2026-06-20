import { describe, expect, it } from "vitest";
import { registerTools } from "../src/tools/index.js";
import { createMockExtensionAPI } from "./helpers/mock-extension-api.js";

describe("tool registration", () => {
	it("registers safe and restricted OMO tool adapters", () => {
		const pi = createMockExtensionAPI();

		registerTools(pi);

		expect(pi.getRegisteredTools().map((tool) => tool.name)).toEqual([
			"omo-inspect-config",
			"omo-read-project-state",
			"omo-write-project-config",
			"omo-run-project-command",
			"omo-fetch-release-metadata",
			"omo-write-global-settings",
			"omo-start-background-session",
		]);
	});

	it("executes read-only safe tools with functional config data", async () => {
		const pi = createMockExtensionAPI();
		registerTools(pi);

		const inspectConfig = pi.getRegisteredTools().find((tool) => tool.name === "omo-inspect-config");
		const readProjectState = pi.getRegisteredTools().find((tool) => tool.name === "omo-read-project-state");

		await expect(Promise.resolve(inspectConfig?.execute())).resolves.toMatchObject({
			details: {
				tool: "omo-inspect-config",
				config: { enabled: true, projectRoot: ".pi/omo/" },
			},
		});
		await expect(Promise.resolve(readProjectState?.execute())).resolves.toMatchObject({
			details: {
				tool: "omo-read-project-state",
				state: {
					enabled: true,
					logLevel: "info",
					allowedPermissionCount: 1,
				},
				readOnly: true,
			},
		});
	});
});
