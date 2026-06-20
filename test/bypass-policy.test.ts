import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "../src/config/index.js";
import {
	createPolicy,
	UNSUPPORTED_NATIVE_BYPASS_TARGETS,
} from "../src/orchestration/index.js";

describe("bypass policy", () => {
	it("documents unsupported native bypass targets as policy records", async () => {
		const policy = createPolicy(DEFAULT_CONFIG);

		expect(UNSUPPORTED_NATIVE_BYPASS_TARGETS.length).toBeGreaterThan(0);

		for (const target of UNSUPPORTED_NATIVE_BYPASS_TARGETS) {
			await expect(policy.evaluate(target)).resolves.toMatchObject({
				allowed: false,
				category: "unsupported-native-bypass",
			});
		}
	});

	it("blocks high-risk tools without their required permission", async () => {
		const policy = createPolicy(DEFAULT_CONFIG);

		await expect(
			policy.evaluate({ type: "tool", name: "omo-run-project-command" }),
		).resolves.toEqual({
			allowed: false,
			category: "blocked-high-risk",
			reason: "Permission process-spawn not granted",
		});
	});
});
