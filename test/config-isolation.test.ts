import { mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkPermission, loadConfig } from "../src/config/index.js";
import { PermissionClass } from "../src/security/permission-classes.js";

describe("config isolation", () => {
	it("loads default config without filesystem side effects", () => {
		const rootDir = mkdtempSync(join(tmpdir(), "omo-pi-config-"));
		const beforeEntries = readdirSync(rootDir);

		const config = loadConfig(rootDir);

		expect(config).toEqual({
			allowedPermissions: [PermissionClass.ReadOnly],
			projectRoot: ".pi/omo/",
			enabled: true,
			logLevel: "info",
		});
		expect(readdirSync(rootDir)).toEqual(beforeEntries);
	});

	it("returns independent permission arrays for each load", () => {
		const firstConfig = loadConfig();
		const secondConfig = loadConfig();

		firstConfig.allowedPermissions.push(PermissionClass.Network);

		expect(secondConfig.allowedPermissions).toEqual([PermissionClass.ReadOnly]);
	});

	it("checks known tool permissions against granted classes", () => {
		const config = loadConfig();

		expect(checkPermission("omo-inspect-config", config)).toBe(true);
		expect(checkPermission("omo-fetch-release-metadata", config)).toBe(false);

		const networkConfig = {
			...config,
			allowedPermissions: [PermissionClass.ReadOnly, PermissionClass.Network],
		};

		expect(checkPermission("omo-fetch-release-metadata", networkConfig)).toBe(
			true,
		);
	});

	it("denies unknown tools and disabled configs", () => {
		const config = loadConfig();

		expect(checkPermission("omo.unknown", config)).toBe(false);
		expect(checkPermission("omo-inspect-config", { ...config, enabled: false })).toBe(
			false,
		);
	});
});
