import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { TSchema } from "@sinclair/typebox";

type Handler = (...args: never[]) => unknown;

export interface RecordedCommand {
	name: string;
	description?: string;
	getArgumentCompletions?: (argumentPrefix: string) => unknown;
	definition: Record<string, unknown>;
	handler: Handler;
}

export interface RecordedTool {
	name: string;
	parameters: TSchema;
	execute: Handler;
	definition: Record<string, unknown>;
}

export interface RecordedShortcut {
	keyId: string;
	description?: string;
	handler: Handler;
}

export interface RecordedFlag {
	name: string;
	type: "boolean" | "string";
	default?: boolean | string;
}

export interface RecordedEvent {
	event: string;
	handler: Handler;
}

export interface MockExtensionAPI extends ExtensionAPI {
	getRegisteredCommands(): RecordedCommand[];
	getRegisteredTools(): RecordedTool[];
	getRegisteredShortcuts(): RecordedShortcut[];
	getRegisteredFlags(): RecordedFlag[];
	getRegisteredEvents(): RecordedEvent[];
}

export function createMockExtensionAPI(): MockExtensionAPI {
	const commands: RecordedCommand[] = [];
	const tools: RecordedTool[] = [];
	const shortcuts: RecordedShortcut[] = [];
	const flags: RecordedFlag[] = [];
	const events: RecordedEvent[] = [];

	const api = {
		registerCommand(
			name: string,
			options: {
				description?: string;
				getArgumentCompletions?: (argumentPrefix: string) => unknown;
				handler: Handler;
				[key: string]: unknown;
			},
		): void {
			commands.push({
				name,
				description: options.description,
				getArgumentCompletions: options.getArgumentCompletions,
				definition: { ...options },
				handler: options.handler,
			});
		},

		registerTool(tool: { name: string; parameters: TSchema; execute: Handler; [key: string]: unknown }): void {
			tools.push({
				name: tool.name,
				parameters: tool.parameters,
				execute: tool.execute,
				definition: { ...tool },
			});
		},

		registerShortcut(keyId: string, options: { description?: string; handler: Handler }): void {
			shortcuts.push({ keyId, description: options.description, handler: options.handler });
		},

		registerFlag(name: string, options: { type: "boolean" | "string"; default?: boolean | string }): void {
			flags.push({ name, type: options.type, default: options.default });
		},

		on(event: string, handler: Handler): void {
			events.push({ event, handler });
		},

		getRegisteredCommands(): RecordedCommand[] {
			return [...commands];
		},

		getRegisteredTools(): RecordedTool[] {
			return [...tools];
		},

		getRegisteredShortcuts(): RecordedShortcut[] {
			return [...shortcuts];
		},

		getRegisteredFlags(): RecordedFlag[] {
			return [...flags];
		},

		getRegisteredEvents(): RecordedEvent[] {
			return [...events];
		},
	};

	return api as MockExtensionAPI;
}
