import { describe, expect, it } from "vitest";
import extension from "../src/index.js";

describe("omo-pi-extension package shape", () => {
	it("should export a function as default", () => {
		expect(extension).toBeDefined();
		expect(typeof extension).toBe("function");
	});

	it("should have arity 1 (accepts pi API)", () => {
		expect(extension).toHaveLength(1);
	});
});
