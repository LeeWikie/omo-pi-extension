import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { registerCommand } from "../commands/types.js";
import type { PolicyResult, RouteTarget } from "../orchestration/index.js";
import { route } from "../orchestration/index.js";
import { planExecuteWorkflow } from "./plan-execute-flow.js";
import type { Workflow, WorkflowStep } from "./types.js";
import { ultraworkWorkflow } from "./ultrawork-flow.js";

export { planExecuteWorkflow } from "./plan-execute-flow.js";
export type { Workflow, WorkflowStep } from "./types.js";
export { ultraworkWorkflow } from "./ultrawork-flow.js";

type ExecutedStep = {
	name: string;
	target: RouteTarget;
	policy: PolicyResult;
};

export function registerWorkflows(pi: ExtensionAPI): void {
	registerWorkflowCommand(pi, ultraworkWorkflow);
	registerWorkflowCommand(pi, planExecuteWorkflow);
}

function registerWorkflowCommand(pi: ExtensionAPI, workflow: Workflow): void {
	registerCommand(pi, workflow.name, {
		description: workflow.description,
		handler: async (_args: string, ctx: ExtensionCommandContext): Promise<unknown> =>
			executeWorkflow(workflow, ctx),
	});
}

async function executeWorkflow(workflow: Workflow, ctx?: ExtensionCommandContext): Promise<unknown> {
	const policy = await route({ type: "command", name: workflow.name });

	if (!policy.allowed) {
		if (ctx?.hasUI) {
			ctx.ui.notify(
				`OMO workflow '${workflow.name}' blocked: ${policy.reason ?? policy.category}`,
				"warning",
			);
		}
		return policy;
	}

	if (ctx?.hasUI) {
		ctx.ui.notify(`OMO workflow '${workflow.name}' triggered`, "info");
	}

	const executedSteps: ExecutedStep[] = [];

	for (const step of workflow.steps) {
		const target = toRouteTarget(step);
		const stepPolicy = await route(target);

		if (!stepPolicy.allowed) {
			if (ctx?.hasUI) {
				ctx.ui.notify(
					`OMO workflow step '${step.name}' blocked: ${stepPolicy.reason ?? stepPolicy.category}`,
					"warning",
				);
			}
			return stepPolicy;
		}

		executedSteps.push({ name: step.name, target, policy: stepPolicy });
	}

	return {
		allowed: true,
		category: policy.category,
		workflow: workflow.name,
		steps: executedSteps,
	};
}

function toRouteTarget(step: WorkflowStep): RouteTarget {
	switch (step.action) {
		case "command":
			return { type: "command", name: step.target };
		case "tool":
			return { type: "tool", name: step.target };
		case "lifecycle":
			return { type: "lifecycle", event: step.target };
		case "wait":
			return { type: "lifecycle", event: step.target };
	}
}
