import { loadConfig } from "../config/index.js";
import { createPolicy } from "./policy.js";
import type { PolicyResult, RouteTarget } from "./types.js";

export {
	createPolicy,
	evaluatePolicy,
	FUTURE_CORE_API_TARGETS,
	OMO_REGISTERED_TARGETS,
	UNSUPPORTED_NATIVE_BYPASS_TARGETS,
} from "./policy.js";
export type { PolicyEngine, PolicyResult, RouteTarget } from "./types.js";

export async function route(target: RouteTarget): Promise<PolicyResult> {
	const config = loadConfig();
	const policy = createPolicy(config);

	return policy.evaluate(target);
}
