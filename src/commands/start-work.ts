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

export function registerStartWorkCommand(pi: ExtensionAPI): void {
	const commandOptions = {
		description: "Start Sisyphus work session from Prometheus plan",
		argumentHint: "[plan-name] [--worktree <path>]",
		getArgumentCompletions: completeMatchingFlags([{ value: "--worktree", label: "--worktree <path>" }]),
		handler: createHandler("omo:start-work"),
	} satisfies PiCommandOptions;

	registerCommand(pi, "omo:start-work", commandOptions);
	registerCommand(pi, "omo-start-work", {
		...commandOptions,
		handler: createHandler("omo-start-work"),
	});
}
