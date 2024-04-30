import { describe, test } from "bun:test";
import { execSync } from "node:child_process";
import { join } from "node:path";

describe("Command: Analyze", () => {
	test("Analyze collections from extracted without verbose", () => {
		const cmd = `bun run ${join(".", "src", "index.ts")} analyze`;
		execSync(cmd, { stdio: "inherit" });
	}, 120000);

	test("Analyze collections from extracted with verbose", () => {
		const cmd = `bun run ${join(".", "src", "index.ts")} analyze --verbose`;
		execSync(cmd, { stdio: "inherit" });
	}, 120000);

	test("Analyze collections from extracted without verbose and write files", () => {
		const cmd = `bun run ${join(".", "src", "index.ts")} analyze --write`;
		execSync(cmd, { stdio: "inherit" });
	}, 120000);

	// test("Analyze collections from extracted without verbose, find duplicates and write files", () => {
	// 	const cmd = `bun run ${join(
	// 		".",
	// 		"src",
	// 		"index.ts",
	// 	)} analyze --duplicates --write`;
	// 	execSync(cmd, { stdio: "inherit" });
	// }, 120000);
});
