import type { PermissionClass } from "../security/permission-classes.js";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface OmOmoExtensionConfig {
	/** Permissions granted to this extension instance. */
	allowedPermissions: PermissionClass[];
	/** Project-local config path. Defaults to `.pi/omo/`. */
	projectRoot: string;
	enabled: boolean;
	logLevel: LogLevel;
}

export type ToolPermission = {
	toolName: string;
	requiredPermission: PermissionClass;
	description: string;
};
