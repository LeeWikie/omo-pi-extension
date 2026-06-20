import type {
	BeforeAgentStartEvent,
	BeforeAgentStartEventResult,
	InputEvent,
	InputEventResult,
	SessionShutdownEvent,
	SessionStartEvent,
	ToolCallEvent,
	ToolCallEventResult,
} from "@earendil-works/pi-coding-agent";
import type { PolicyResult, RouteTarget } from "../orchestration/index.js";
import * as orchestration from "../orchestration/index.js";

export type LifecycleEventName =
	| "before_agent_start"
	| "tool_call"
	| "message_end"
	| "input"
	| "session_start"
	| "session_shutdown";

export interface LifecycleOrchestration {
	route(target: RouteTarget): Promise<PolicyResult>;
}

export interface LifecycleHandlers {
	beforeAgentStart(event: BeforeAgentStartEvent, ctx: unknown): Promise<BeforeAgentStartEventResult | undefined>;
	toolCall(event: ToolCallEvent, ctx: unknown): Promise<ToolCallEventResult | undefined>;
	messageEnd(event: { type?: "message_end"; message: unknown }, ctx: unknown): Promise<undefined>;
	input(event: InputEvent, ctx: unknown): Promise<InputEventResult | undefined>;
	sessionStart(event: SessionStartEvent, ctx: unknown): Promise<void>;
	sessionShutdown(event: SessionShutdownEvent, ctx: unknown): Promise<void>;
}

const OMO_CONTEXT_PROMPT = [
	"",
	"<omo_lifecycle_context>",
	"OhMyOpenCode lifecycle compatibility is active through the Pi extension adapter.",
	"Use Pi-native capabilities only; unsupported OpenCode host hooks are intentionally omitted.",
	"</omo_lifecycle_context>",
].join("\n");

export function createLifecycleHandlers(adapter: LifecycleOrchestration = orchestration): LifecycleHandlers {
	return {
		async beforeAgentStart(event) {
			const policy = await routeLifecycle(adapter, "before_agent_start");

			if (!policy.allowed) {
				return;
			}

			return {
				systemPrompt: `${event.systemPrompt}${OMO_CONTEXT_PROMPT}`,
			};
		},

		async toolCall() {
			const policy = await routeLifecycle(adapter, "tool_call");

			if (!policy.allowed) {
				return {
					block: true,
					reason: policy.reason ?? "Lifecycle policy blocked tool execution",
				};
			}
		},

		async messageEnd() {
			const policy = await routeLifecycle(adapter, "message_end");

			if (!policy.allowed) {
				return;
			}
		},

		async input() {
			const policy = await routeLifecycle(adapter, "input");

			if (!policy.allowed) {
				return { action: "continue" };
			}
		},

		async sessionStart() {
			await routeLifecycle(adapter, "session_start");
		},

		async sessionShutdown() {
			await routeLifecycle(adapter, "session_shutdown");
		},
	};
}

async function routeLifecycle(adapter: LifecycleOrchestration, event: LifecycleEventName): Promise<PolicyResult> {
	return adapter.route({ type: "lifecycle", event });
}
