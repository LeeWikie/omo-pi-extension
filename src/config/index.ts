import {
	DEFAULT_PERMISSION_CONFIG,
	PermissionClass,
	type PermissionConfig,
} from "../security/permission-classes.js";
import type { OmOmoExtensionConfig } from "./types.js";

export type { LogLevel, OmOmoExtensionConfig, ToolPermission } from "./types.js";

export const DEFAULT_CONFIG: OmOmoExtensionConfig = {
	allowedPermissions: [PermissionClass.ReadOnly],
	projectRoot: ".pi/omo/",
	enabled: true,
	logLevel: "info",
};

export function loadConfig(rootDir?: string): OmOmoExtensionConfig {
	void rootDir;

	return {
		...DEFAULT_CONFIG,
		allowedPermissions: [...DEFAULT_CONFIG.allowedPermissions],
	};
}

export function checkPermission(
	toolName: string,
	config: OmOmoExtensionConfig,
): boolean {
	if (!config.enabled) {
		return false;
	}

	const permissionConfig: PermissionConfig = DEFAULT_PERMISSION_CONFIG;
	const requiredPermission = permissionConfig[toolName];

	if (requiredPermission === undefined) {
		return false;
	}

	return config.allowedPermissions.includes(requiredPermission);
}
