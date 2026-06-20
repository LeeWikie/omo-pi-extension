import { describe, expect, it, vi } from "vitest";
import { createLifecycleHandlers } from "../src/lifecycle/hooks.js";
import { registerLifecycle } from "../src/lifecycle/index.js";
import { register } from "../src/register.js";
import { createMockExtensionAPI } from "./helpers/mock-extension-api.js";

describe("lifecycle registration", () => {
	it("registers supported Pi lifecycle handlers", () => {
		const pi = createMockExtensionAPI();

		registerLifecycle(pi);

		expect(pi.getRegisteredEvents().map((event) => event.event)).toEqual([
			"before_agent_start",
			"tool_call",
			"message_end",
			"input",
			"session_start",
			"session_shutdown",
		]);
	});

	it("wires lifecycle handlers from the main register function", () => {
		const pi = createMockExtensionAPI();

		register(pi);

		expect(pi.getRegisteredEvents().map((event) => event.event)).toContain("before_agent_start");
		expect(pi.getRegisteredEvents().map((event) => event.event)).toContain("tool_call");
	});

	it("routes each lifecycle handler through orchestration", async () => {
		const route = vi.fn(async () => ({ allowed: true, category: "handled-by-omo" as const }));
		const handlers = createLifecycleHandlers({ route });

		await handlers.beforeAgentStart({ systemPrompt: "base" } as never, {});
		await handlers.toolCall({ toolName: "bash" } as never, {});
		await handlers.messageEnd({ message: { role: "assistant" } } as never, {});
		await handlers.input({ text: "hello" } as never, {});
		await handlers.sessionStart({ reason: "startup" } as never, {});
		await handlers.sessionShutdown({ reason: "quit" } as never, {});

		expect(route.mock.calls.map(([target]) => target)).toEqual([
			{ type: "lifecycle", event: "before_agent_start" },
			{ type: "lifecycle", event: "tool_call" },
			{ type: "lifecycle", event: "message_end" },
			{ type: "lifecycle", event: "input" },
			{ type: "lifecycle", event: "session_start" },
			{ type: "lifecycle", event: "session_shutdown" },
		]);
	});

	it("blocks tool calls when orchestration denies the lifecycle hook", async () => {
		const handlers = createLifecycleHandlers({
			route: vi.fn(async () => ({
				allowed: false,
				category: "requires-future-core-api" as const,
				reason: "blocked by policy",
			})),
		});

		await expect(handlers.toolCall({ toolName: "bash" } as never, {})).resolves.toEqual({
			block: true,
			reason: "blocked by policy",
		});
	});
});
