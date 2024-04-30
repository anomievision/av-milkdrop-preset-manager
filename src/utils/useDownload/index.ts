import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { useError } from "../useError";
import { isProgramInstalled } from "../useFilesystem";
import { useRepoPatcher } from "./patcher";

// Download a repository from GitHub
export function useRepositoryDownloader(
	repository: string,
	branch: string,
	output: string,
	force = false,
): { data?: string; error?: string } {
	// Check if git is installed
	if (!isProgramInstalled("git")) {
		return { error: "Git is not installed" };
	}

	// Construct output name from repository URL and branch
	const outputName = `${repository
		.split("/")
		.pop()
		?.replace(".git", "")}-${branch}`;

	// Construct output path from output directory and output name
	const outputPath = join(output, outputName);

	// Check if the output path exists
	if (existsSync(outputPath)) {
		// Remove the existing directory if force is true
		if (force) {
			rmSync(outputPath, { recursive: true });
		}
		// Otherwise, return the output path as an error (used as warning in the UI)
		else {
			return { data: outputPath, error: "download already exists. skipped..." };
		}
	}

	// Download the repository
	try {
		execSync(`git clone --branch ${branch} ${repository} ${outputPath}`, {
			stdio: "ignore",
		});
	} catch (error: unknown) {
		return { error: useError(error) };
	}

	// Run repository patcher
	useRepoPatcher(outputName, outputPath);

	return { data: outputPath };
}
