import { describe, test } from "bun:test";
import { execSync } from "node:child_process";
import { join } from "node:path";

describe("Command: Extract", () => {
	test("Extract collections from downloads with verbose", () => {
		const cmd = `bun run ${join(".", "src", "index.ts")} extract --verbose`;
		execSync(cmd, { stdio: "inherit" });
	}, 120000);

	test("Extract collections from downloads with force", () => {
		const cmd = `bun run ${join(".", "src", "index.ts")} extract --force`;
		execSync(cmd, { stdio: "inherit" });
	}, 120000);

	test("Extract collections from downloads (excluding: ) with force", () => {
		const cmd = `bun run ${join(
			".",
			"src",
			"index.ts",
		)} extract --exclude "projectm-classic" --force `;
		execSync(cmd, { stdio: "inherit" });
	}, 120000);
});
