export type WorkflowStep = {
	name: string;
	description: string;
	action: "command" | "tool" | "lifecycle" | "wait";
	target: string;
};

export type Workflow = {
	name: string;
	description: string;
	steps: WorkflowStep[];
};
