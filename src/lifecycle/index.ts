import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createLifecycleHandlers, type LifecycleOrchestration } from "./hooks.js";

export function registerLifecycle(pi: ExtensionAPI, orchestration?: LifecycleOrchestration): void {
	const handlers = createLifecycleHandlers(orchestration);

	pi.on("before_agent_start", handlers.beforeAgentStart);
	pi.on("tool_call", handlers.toolCall);
	pi.on("message_end", handlers.messageEnd);
	pi.on("input", handlers.input);
	pi.on("session_start", handlers.sessionStart);
	pi.on("session_shutdown", handlers.sessionShutdown);
}
