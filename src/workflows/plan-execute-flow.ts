import type { Workflow } from "./types.js";

export const planExecuteWorkflow: Workflow = {
	name: "omo:workflow:plan-execute",
	description: "Execute the OMO plan to execution workflow",
	steps: [
		{
			name: "create-plan",
			description: "Create an adversarial execution plan with hyperplan",
			action: "command",
			target: "omo:hyperplan",
		},
		{
			name: "start-execution",
			description: "Start Sisyphus execution from the selected plan",
			action: "command",
			target: "omo:start-work",
		},
		{
			name: "cleanup-lifecycle",
			description: "Run session shutdown lifecycle cleanup",
			action: "lifecycle",
			target: "session_shutdown",
		},
	],
};
