import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";

export interface CommandCompletion {
	value: string;
	label: string;
}

export interface PiCommandOptions {
	description: string;
	argumentHint?: string;
	getArgumentCompletions?: (argumentPrefix: string) => CommandCompletion[] | null;
	handler: (args: string, ctx: ExtensionCommandContext) => Promise<unknown>;
}

export function registerCommand(pi: ExtensionAPI, name: string, options: PiCommandOptions): void {
	pi.registerCommand(name, options as Parameters<ExtensionAPI["registerCommand"]>[1]);
}

export function completeMatchingFlags(flags: CommandCompletion[]) {
	return (argumentPrefix: string): CommandCompletion[] | null => {
		const activePrefix = argumentPrefix.trim().split(/\s+/).at(-1) ?? "";
		const matches = flags.filter((flag) => flag.value.startsWith(activePrefix));

		return matches.length > 0 ? matches : null;
	};
}
