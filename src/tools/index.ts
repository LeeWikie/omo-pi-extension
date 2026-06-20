import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { loadConfig } from "../config/index.js";
import type { OmOmoExtensionConfig } from "../config/types.js";
import { registerRestrictedTools } from "./restricted-tools.js";
import { registerSafeTools } from "./safe-tools.js";

export function registerTools(
	pi: ExtensionAPI,
	config: OmOmoExtensionConfig = loadConfig(),
): void {
	registerSafeTools(pi, config);
	registerRestrictedTools(pi, config);
}
