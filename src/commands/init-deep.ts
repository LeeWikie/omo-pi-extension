import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import * as orchestration from "../orchestration/index.js";
import { completeMatchingFlags, type PiCommandOptions, registerCommand } from "./types.js";

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

export function registerInitDeepCommand(pi: ExtensionAPI): void {
	const commandOptions = {
		description: "Initialize hierarchical AGENTS.md knowledge base",
		argumentHint: "[--create-new] [--max-depth=N]",
		getArgumentCompletions: completeMatchingFlags([
			{ value: "--create-new", label: "--create-new" },
			{ value: "--max-depth=", label: "--max-depth=N" },
		]),
		handler: createHandler("omo:init-deep"),
	} satisfies PiCommandOptions;

	registerCommand(pi, "omo:init-deep", commandOptions);
	registerCommand(pi, "omo-init-deep", {
		...commandOptions,
		handler: createHandler("omo-init-deep"),
	});
}
