export type RouteTarget =
	| { type: "command"; name: string }
	| { type: "tool"; name: string }
	| { type: "lifecycle"; event: string }
	| { type: "shortcut"; keyId: string };

export type PolicyResult = {
	allowed: boolean;
	result?: unknown;
	reason?: string;
	category:
		| "handled-by-omo"
		| "blocked-high-risk"
		| "unsupported-native-bypass"
		| "requires-future-core-api";
};

export interface PolicyEngine {
	evaluate(target: RouteTarget): Promise<PolicyResult>;
}
