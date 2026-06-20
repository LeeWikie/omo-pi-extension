import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import * as orchestration from "../orchestration/index.js";
import { completeMatchingFlags, type PiCommandOptions, registerCommand } from "./types.js";

const description = "Start ultrawork autonomous loop";
const argumentHint = '"task description" [--completion-promise=TEXT] [--strategy=reset|continue]';
const getArgumentCompletions = completeMatchingFlags([
	{ value: "--completion-promise=", label: "--completion-promise=TEXT" },
	{ value: "--strategy=reset", label: "--strategy=reset" },
	{ value: "--strategy=continue", label: "--strategy=continue" },
]);

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

export function registerUltraworkCommand(pi: ExtensionAPI): void {
	const commandOptions = {
		description,
		argumentHint,
		getArgumentCompletions,
		handler: createHandler("omo:ultrawork"),
	} satisfies PiCommandOptions;

	registerCommand(pi, "omo:ultrawork", commandOptions);
	registerCommand(pi, "omo-ultrawork", {
		...commandOptions,
		handler: createHandler("omo-ultrawork"),
	});
	registerCommand(pi, "omo:ulw", {
		...commandOptions,
		handler: createHandler("omo:ulw"),
	});
	registerCommand(pi, "omo-ulw", {
		...commandOptions,
		handler: createHandler("omo-ulw"),
	});
}
