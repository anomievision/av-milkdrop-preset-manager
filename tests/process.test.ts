import { describe, test } from "bun:test";
import { execSync } from "node:child_process";
import { join } from "node:path";

describe("Run Process", () => {
	test("Download a collection", () => {
		const cmd = `bun run ${join(
			".",
			"src",
			"index.ts",
		)} download --collections en-d`;
		execSync(cmd, { stdio: "inherit" });
	}, 120000);

	test("Extract a collection", () => {
		const cmd = `bun run ${join(".", "src", "index.ts")} extract`;
		execSync(cmd, { stdio: "inherit" });
	}, 120000);

	test("Analyze a collection", () => {
		const cmd = `bun run ${join(
			".",
			"src",
			"index.ts",
		)} analyze --write --verbose`;
		execSync(cmd, { stdio: "inherit" });
	}, 120000);

	test("Normalize a collection", () => {
		const cmd = `bun run ${join(
			".",
			"src",
			"index.ts",
		)} normalize --ignore-reviews --write --verbose`;
		execSync(cmd, { stdio: "inherit" });
	}, 120000);
});
