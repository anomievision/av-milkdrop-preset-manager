import { statSync } from "node:fs";

export function checkIfDirOrFile(path: string): "file" | "dir" {
	// Check if input is a file or directory
	const stats = statSync(path, { throwIfNoEntry: false });

	if (stats?.isFile()) {
		return "file";
	}

	if (stats?.isDirectory()) {
		return "dir";
	}

	throw new Error("Invalid path");
}
