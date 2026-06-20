import type { ExtensionAPI, ExtensionFactory } from "@earendil-works/pi-coding-agent";
import { register } from "./register.js";

/**
 * Default export: the Pi extension factory function.
 *
 * Receives the Pi ExtensionAPI and orchestrates registration of
 * commands, tools, shortcuts, flags, and event handlers.
 */
const extension: ExtensionFactory = (pi: ExtensionAPI): void | Promise<void> => {
	return register(pi);
};

export default extension;
