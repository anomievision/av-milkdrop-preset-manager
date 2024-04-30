import { describe, test } from "bun:test";
import { execSync } from "node:child_process";
import { join } from "node:path";

describe("Command: Normalize", () => {
	test("Normalize collections from analyzed without verbose", () => {
		const cmd = `bun run ${join(".", "src", "index.ts")} normalize`;
		execSync(cmd, { stdio: "inherit" });
	}, 120000);

	test("Normalize collections from analyzed with verbose", () => {
		const cmd = `bun run ${join(".", "src", "index.ts")} normalize --verbose`;
		execSync(cmd, { stdio: "inherit" });
	}, 120000);

	test("Normalize collections from analyzed without verbose, write files", () => {
		const cmd = `bun run ${join(
			".",
			"src",
			"index.ts",
		)} normalize --ignore-reviews --write`;
		execSync(cmd, { stdio: "inherit" });
	}, 120000);
});
