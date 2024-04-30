import { readdirSync, renameSync } from "node:fs";
import { join, parse, sep } from "node:path";
import { createDirectory } from "../useFilesystem";

export function useRepoPatcher(repository: string, outputPath: string): void {
	switch (repository) {
		// ?PATCH: This repo has categories of presents in root, moving to a single directory
		case "presets-cream-of-the-crop-master": {
			// New parent directory name
			const newParent = "cream-of-the-crop";

			// Get contents of output directory
			const contents = readdirSync(outputPath);

			// Files to ignore
			const ignore = [".git", "license", "readme"];

			// Move contents with subdirectories to a single directory
			for (const file of contents) {
				// If on ignore list, skip
				if (
					ignore.some((ignore) => file.toLocaleLowerCase().includes(ignore))
				) {
					continue;
				}

				// Parse the file name
				const { dir, name, ext } = parse(file);

				// Split the directory into parts
				const dirParts = dir.split(sep);

				// Prepend the new parent directory to the directory parts
				dirParts.unshift(newParent);

				// Join the new directory parts
				const newDir = join(outputPath, dirParts.join(sep));
				const output = join(newDir, `${name}${ext}`);

				// Create the new directory if it doesn't exist
				createDirectory(newDir);

				const input = join(outputPath, file);

				// Move the file
				renameSync(input, output);
			}
		}
	}
}
