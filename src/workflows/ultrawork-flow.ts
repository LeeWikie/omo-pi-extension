import type { Workflow } from "./types.js";

export const ultraworkWorkflow: Workflow = {
	name: "omo:workflow:ultrawork",
	description: "Execute the OMO ultrawork workflow",
	steps: [
		{
			name: "start-ultrawork",
			description: "Start the ultrawork autonomous command adapter",
			action: "command",
			target: "omo:ultrawork",
		},
		{
			name: "prepare-agent-context",
			description: "Apply lifecycle context before the agent starts",
			action: "lifecycle",
			target: "before_agent_start",
		},
		{
			name: "enforce-tool-policy",
			description: "Apply lifecycle tool-call policy during autonomous work",
			action: "lifecycle",
			target: "tool_call",
		},
		{
			name: "observe-message-completion",
			description: "Apply lifecycle completion handling after assistant messages",
			action: "lifecycle",
			target: "message_end",
		},
		{
			name: "check-completion-state",
			description: "Check project state through the safe completion-inspection tool",
			action: "tool",
			target: "omo-read-project-state",
		},
	],
};
