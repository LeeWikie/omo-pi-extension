import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerHandoffCommand } from "./handoff.js";
import { registerHyperplanCommand } from "./hyperplan.js";
import { registerInitDeepCommand } from "./init-deep.js";
import { registerStartWorkCommand } from "./start-work.js";
import { registerUltraworkCommand } from "./ultrawork.js";

export function registerCommands(pi: ExtensionAPI): void {
	registerUltraworkCommand(pi);
	registerHyperplanCommand(pi);
	registerInitDeepCommand(pi);
	registerHandoffCommand(pi);
	registerStartWorkCommand(pi);
}
