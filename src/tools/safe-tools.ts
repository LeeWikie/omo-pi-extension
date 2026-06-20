import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import type { OmOmoExtensionConfig } from "../config/types.js";
import { route } from "../orchestration/index.js";

type SafeToolName = "omo-inspect-config" | "omo-read-project-state" | "omo-write-project-config";

export function registerSafeTools(pi: ExtensionAPI, config: OmOmoExtensionConfig): void {
	registerSafeTool(pi, config, "omo-inspect-config", {
		label: "Inspect OMO Config",
		description: "Inspect the active OMO Pi extension configuration.",
		parameters: Type.Object({}),
		execute: () => ({
			tool: "omo-inspect-config",
			config: {
				allowedPermissions: [...config.allowedPermissions],
				projectRoot: config.projectRoot,
				enabled: config.enabled,
				logLevel: config.logLevel,
			},
		}),
	});

	registerSafeTool(pi, config, "omo-read-project-state", {
		label: "Read OMO Project State",
		description: "Read static OMO project state without touching the filesystem.",
		parameters: Type.Object({}),
		execute: () => ({
			tool: "omo-read-project-state",
			projectRoot: config.projectRoot,
			state: {
				enabled: config.enabled,
				logLevel: config.logLevel,
				allowedPermissionCount: config.allowedPermissions.length,
			},
			readOnly: true,
		}),
	});

	registerSafeTool(pi, config, "omo-write-project-config", {
		label: "Preview OMO Project Config Write",
		description: "Preview a project-local OMO configuration update.",
		parameters: Type.Object({
			enabled: Type.Optional(Type.Boolean()),
			logLevel: Type.Optional(Type.Union([
				Type.Literal("debug"),
				Type.Literal("info"),
				Type.Literal("warn"),
				Type.Literal("error"),
			])),
		}),
		execute: (input: { enabled?: boolean; logLevel?: string }) => ({
			tool: "omo-write-project-config",
			projectRoot: config.projectRoot,
			applied: false,
			action: "Previewed project-local configuration changes without writing files.",
			preview: {
				enabled: input?.enabled ?? config.enabled,
				logLevel: input?.logLevel ?? config.logLevel,
			},
		}),
	});
}

function registerSafeTool(
	pi: ExtensionAPI,
	_config: OmOmoExtensionConfig,
	name: SafeToolName,
	tool: {
		label: string;
		description: string;
		parameters: ReturnType<typeof Type.Object>;
		execute: (input: never) => unknown;
	},
): void {
	pi.registerTool({
		name,
		label: tool.label,
		description: tool.description,
		parameters: tool.parameters,
		async execute(_toolCallId, params) {
			const policyResult = await route({ type: "tool", name });

			if (!policyResult.allowed) {
				const reason = policyResult.reason ?? "Blocked";

				return {
					content: [{ type: "text", text: reason }],
					details: { blocked: true, reason },
				};
			}

			const details = tool.execute(params as never);

			return {
				content: [{ type: "text", text: JSON.stringify(details) }],
				details,
			};
		},
	});
}
