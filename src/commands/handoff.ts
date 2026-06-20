import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import * as orchestration from "../orchestration/index.js";
import { type PiCommandOptions, registerCommand } from "./types.js";

function createHandler(routeName: string) {
	return async (args: string, ctx: ExtensionCommandContext): Promise<unknown> => {
		const policy = await orchestration.route({ type: "command", name: routeName });
		if (!policy.allowed) {
			if (ctx?.hasUI) {
				ctx.ui.notify(`OMO command '${routeName}' blocked: ${policy.reason ?? policy.category}`, "warning");
			}
			return policy.result;
		}
		if (ctx?.hasUI) {
			ctx.ui.notify(`OMO '${routeName}' triggered${args ? ` with args: ${args}` : ""}`, "info");
		}
		return {
			command: routeName,
			args,
			status: "routed",
			message: `OMO orchestration routed '${routeName}'. Full implementation pending.`,
		};
	};
}

export function registerHandoffCommand(pi: ExtensionAPI): void {
	const commandOptions = {
		description: "Create a detailed context summary for continuing work in a new session",
		argumentHint: "[goal]",
		getArgumentCompletions: () => null,
		handler: createHandler("omo:handoff"),
	} satisfies PiCommandOptions;

	registerCommand(pi, "omo:handoff", commandOptions);
	registerCommand(pi, "omo-handoff", {
		...commandOptions,
		handler: createHandler("omo-handoff"),
	});
}
