import { checkPermission } from "../config/index.js";
import type { OmOmoExtensionConfig } from "../config/types.js";
import { DEFAULT_PERMISSION_CONFIG } from "../security/permission-classes.js";
import type { PolicyEngine, PolicyResult, RouteTarget } from "./types.js";

export const OMO_REGISTERED_TARGETS: readonly RouteTarget[] = Object.freeze([
	{ type: "command", name: "omo.config" },
	{ type: "command", name: "omo.resources.get" },
	{ type: "command", name: "omo.resources.list" },
	{ type: "command", name: "omo:ultrawork" },
	{ type: "command", name: "omo-ultrawork" },
	{ type: "command", name: "omo:ulw" },
	{ type: "command", name: "omo-ulw" },
	{ type: "command", name: "omo:hyperplan" },
	{ type: "command", name: "omo-hyperplan" },
	{ type: "command", name: "omo:init-deep" },
	{ type: "command", name: "omo-init-deep" },
	{ type: "command", name: "omo:handoff" },
	{ type: "command", name: "omo-handoff" },
	{ type: "command", name: "omo:start-work" },
	{ type: "command", name: "omo-start-work" },
	{ type: "command", name: "omo:workflow:ultrawork" },
	{ type: "command", name: "omo:workflow:plan-execute" },
	{ type: "tool", name: "omo-inspect-config" },
	{ type: "tool", name: "omo-read-project-state" },
	{ type: "tool", name: "omo-write-project-config" },
	{ type: "tool", name: "omo-run-project-command" },
	{ type: "tool", name: "omo-fetch-release-metadata" },
	{ type: "tool", name: "omo-write-global-settings" },
	{ type: "tool", name: "omo-start-background-session" },
	{ type: "lifecycle", event: "before_agent_start" },
	{ type: "lifecycle", event: "tool_call" },
	{ type: "lifecycle", event: "message_end" },
	{ type: "lifecycle", event: "input" },
	{ type: "lifecycle", event: "session_start" },
	{ type: "lifecycle", event: "session_shutdown" },
]);

export const UNSUPPORTED_NATIVE_BYPASS_TARGETS: readonly RouteTarget[] = Object.freeze([
	{ type: "command", name: "pi.native.command" },
	{ type: "tool", name: "pi.native.tool" },
	{ type: "lifecycle", event: "pi.native.lifecycle" },
]);

export const FUTURE_CORE_API_TARGETS: readonly RouteTarget[] = Object.freeze([
	{ type: "shortcut", keyId: "pi.native.shortcut" },
]);

export function createPolicy(config: OmOmoExtensionConfig): PolicyEngine {
	return {
		async evaluate(target: RouteTarget): Promise<PolicyResult> {
			return evaluatePolicy(config, target);
		},
	};
}

export function evaluatePolicy(
	config: OmOmoExtensionConfig,
	target: RouteTarget,
): PolicyResult {
	if (isHighRiskTool(target) && !checkPermission(target.name, config)) {
		return {
			allowed: false,
			category: "blocked-high-risk",
			reason: `Permission ${DEFAULT_PERMISSION_CONFIG[target.name]} not granted`,
		};
	}

	if (matchesAny(target, OMO_REGISTERED_TARGETS)) {
		return {
			allowed: true,
			category: "handled-by-omo",
		};
	}

	if (matchesAny(target, UNSUPPORTED_NATIVE_BYPASS_TARGETS)) {
		return {
			allowed: false,
			category: "unsupported-native-bypass",
			reason: "Pi native path is outside OMO extension ownership",
		};
	}

	return {
		allowed: false,
		category: "requires-future-core-api",
		reason: "Target is not registered by OMO and requires Pi core routing support",
	};
}

function isHighRiskTool(
	target: RouteTarget,
): target is { type: "tool"; name: keyof typeof DEFAULT_PERMISSION_CONFIG } {
	return target.type === "tool" && target.name in DEFAULT_PERMISSION_CONFIG;
}

function matchesAny(target: RouteTarget, records: readonly RouteTarget[]): boolean {
	return records.some((record) => matchesTarget(target, record));
}

function matchesTarget(target: RouteTarget, record: RouteTarget): boolean {
	if (target.type !== record.type) {
		return false;
	}

	switch (target.type) {
		case "command":
			return record.type === "command" && target.name === record.name;
		case "tool":
			return record.type === "tool" && target.name === record.name;
		case "lifecycle":
			return record.type === "lifecycle" && target.event === record.event;
		case "shortcut":
			return record.type === "shortcut" && target.keyId === record.keyId;
	}
}
