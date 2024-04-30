import { describe, test } from "bun:test";
import { execSync } from "node:child_process";
import { join } from "node:path";

describe("Command: Download > List", () => {
	test("List collections", () => {
		const cmd = `bun run ${join(".", "src", "index.ts")} download list`;
		execSync(cmd, { stdio: "inherit" });
	});

	test("List collections as Simple (useful in CLI)", () => {
		const cmd = `bun run ${join(
			".",
			"src",
			"index.ts",
		)} download list --simplify`;
		execSync(cmd, { stdio: "inherit" });
	});
});

describe("Command: Download", () => {
	test("Download default collections with verbose", () => {
		const cmd = `bun run ${join(
			".",
			"src",
			"index.ts",
		)} download --output ${join(".", "output", "downloads")} --verbose`;
		execSync(cmd, { stdio: "inherit" });
	});

	test("Download default collections with force", () => {
		const cmd = `bun run ${join(
			".",
			"src",
			"index.ts",
		)} download --output ${join(".", "output", "downloads")} --force`;
		execSync(cmd, { stdio: "inherit" });
	});

	test("Download select collections: projectm-classic, milkdrop-original", () => {
		const cmd = `bun run ${join(
			".",
			"src",
			"index.ts",
		)} download --output ${join(
			".",
			"output",
			"downloads",
		)} --collections projectm-classic milkdrop-original`;
		execSync(cmd, { stdio: "inherit" });
	});

	test("Download all collections", () => {
		const cmd = `bun run ${join(
			".",
			"src",
			"index.ts",
		)} download --output ${join(".", "output", "downloads")} --collections all`;
		execSync(cmd, { stdio: "inherit" });
	}, 120000);
});
