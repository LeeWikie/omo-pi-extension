/**
 * Permission classes describe the boundary crossed by an extension tool.
 *
 * Use a frozen object instead of a TypeScript enum so the package remains
 * compatible with `erasableSyntaxOnly` builds.
 */
export const PermissionClass = {
	ReadOnly: "read-only",
	ProjectWrite: "project-write",
	ProcessSpawn: "process-spawn",
	Network: "network",
	GlobalConfig: "global-config",
	LongLivedProcess: "long-lived-process",
} as const;

export type PermissionClass =
	(typeof PermissionClass)[keyof typeof PermissionClass];

export const PERMISSION_CLASSES = Object.values(PermissionClass);

export type PermissionConfig = Record<string, PermissionClass>;

/**
 * First-stage tool permission registry.
 *
 * The entries are boundary examples used by policy checks and tests. They do
 * not register executable tools or grant any capability by themselves.
 */
	export const DEFAULT_PERMISSION_CONFIG = {
	"omo-inspect-config": PermissionClass.ReadOnly,
	"omo-read-project-state": PermissionClass.ReadOnly,
	"omo-write-project-config": PermissionClass.ProjectWrite,
	"omo-run-project-command": PermissionClass.ProcessSpawn,
	"omo-fetch-release-metadata": PermissionClass.Network,
	"omo-write-global-settings": PermissionClass.GlobalConfig,
	"omo-start-background-session": PermissionClass.LongLivedProcess,
} as const satisfies PermissionConfig;
