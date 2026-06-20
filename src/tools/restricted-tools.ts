import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import type { OmOmoExtensionConfig } from "../config/types.js";
import { route } from "../orchestration/index.js";

type RestrictedToolName =
	| "omo-run-project-command"
	| "omo-fetch-release-metadata"
	| "omo-write-global-settings"
	| "omo-start-background-session";

const restrictedTools: Array<{
	name: RestrictedToolName;
	label: string;
	description: string;
	parameters: ReturnType<typeof Type.Object>;
}> = [
	{
		name: "omo-run-project-command",
		label: "Run OMO Project Command",
		description: "Run a project command when process-spawn permission is granted.",
		parameters: Type.Object({ command: Type.String() }),
	},
	{
		name: "omo-fetch-release-metadata",
		label: "Fetch OMO Release Metadata",
		description: "Fetch release metadata when network permission is granted.",
		parameters: Type.Object({ packageName: Type.String() }),
	},
	{
		name: "omo-write-global-settings",
		label: "Write OMO Global Settings",
		description: "Write global OMO settings when global-config permission is granted.",
		parameters: Type.Object({ key: Type.String(), value: Type.Unknown() }),
	},
	{
		name: "omo-start-background-session",
		label: "Start OMO Background Session",
		description: "Start a background session when long-lived-process permission is granted.",
		parameters: Type.Object({ label: Type.Optional(Type.String()) }),
	},
];

export function registerRestrictedTools(pi: ExtensionAPI, _config: OmOmoExtensionConfig): void {
	for (const tool of restrictedTools) {
		pi.registerTool({
			name: tool.name,
			label: tool.label,
			description: tool.description,
			parameters: tool.parameters,
			async execute() {
				const policyResult = await route({ type: "tool", name: tool.name });

				if (!policyResult.allowed) {
					const reason = policyResult.reason ?? "Blocked";

					return {
						content: [{ type: "text", text: reason }],
						details: { blocked: true, reason },
					};
				}

				const details = {
					blocked: false,
					tool: tool.name,
					implemented: false,
					reason: "Tool is recognized and permission was granted, but its execution adapter still needs a safe implementation. See the permission docs before enabling runtime effects.",
				};

				return {
					content: [{ type: "text", text: details.reason }],
					details,
				};
			},
		});
	}
}
