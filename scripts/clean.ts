import { existsSync, rmSync } from "node:fs";

console.info("Cleaning up...");

const paths = ["dist"];

for (const path of paths) {
	if (existsSync(path)) {
		rmSync(path, { recursive: true });
	}
}
