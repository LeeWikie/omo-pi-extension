import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { registerCommands } from "./commands/index.js";
import { registerCommand } from "./commands/types.js";
import { loadConfig } from "./config/index.js";
import { registerLifecycle } from "./lifecycle/index.js";
import { route } from "./orchestration/index.js";
import { registerResources } from "./resources/index.js";
import { registerTools } from "./tools/index.js";
import { registerWorkflows } from "./workflows/index.js";

/**
 * Registration orchestrator.
 *
 * Called by the extension factory to wire up all commands, tools,
 * shortcuts, flags, and event handlers provided by this extension.
 */
export function register(pi: ExtensionAPI): void {
	registerCommands(pi);
	registerTools(pi);
	registerResources(pi);
	registerWorkflows(pi);

	registerCommand(pi, "omo.config", {
		description: "Inspect the OMO Pi extension default configuration",
		handler: async (_args: string, ctx: ExtensionCommandContext) => {
			const policyResult = await route({ type: "command", name: "omo.config" });

			if (!policyResult.allowed) {
				if (ctx?.hasUI) {
					ctx.ui.notify(`OMO command 'omo.config' blocked: ${policyResult.reason ?? policyResult.category}`, "warning");
				}
				return policyResult;
			}

			if (ctx?.hasUI) {
				ctx.ui.notify("OMO 'omo.config' triggered", "info");
			}

			void loadConfig();

			return {
				command: "omo.config",
				args: "",
				status: "routed",
				message: "OMO orchestration routed 'omo.config'. Full implementation pending.",
			};
		},
	});

	// Shortcuts and flags are intentionally deferred; see the lifecycle matrix for supported surfaces.
	registerLifecycle(pi);
}
