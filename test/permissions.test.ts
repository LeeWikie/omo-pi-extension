import { describe, expect, it } from "vitest";
import {
	DEFAULT_PERMISSION_CONFIG,
	PERMISSION_CLASSES,
	PermissionClass,
} from "../src/security/permission-classes.js";

describe("permission classes", () => {
	it("defines every first-stage permission boundary", () => {
		expect(PERMISSION_CLASSES).toEqual([
			"read-only",
			"project-write",
			"process-spawn",
			"network",
			"global-config",
			"long-lived-process",
		]);
	});

	it("maps at least one tool to each permission class", () => {
		const configuredClasses = new Set(Object.values(DEFAULT_PERMISSION_CONFIG));

		for (const permissionClass of Object.values(PermissionClass)) {
			expect(configuredClasses.has(permissionClass)).toBe(true);
		}
	});
});
