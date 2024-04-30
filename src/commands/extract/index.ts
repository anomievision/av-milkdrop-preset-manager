import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Command } from "commander";
import { settings } from "../../settings";
import {
	consoleError,
	consoleHeader,
	consoleItem,
	consoleTitle,
} from "../../utils/useConsole";
import { useExtractor } from "../../utils/useExtract";
import { isFileBroken } from "../../utils/useFilesystem";

export function addExtract(): Command {
	const command = new Command()
		.command("extract")
		.description("extract preset collections")
		.option(
			"-x, --exclude <keywords...>",
			"exclude files with keywords in their name",
		)
		.option("-f, --force", "force download")
		.option(
			"-i, --input <directory>",
			"input directory for extraction",
			settings.extractSettings.defaultInput,
		)
		.option(
			"-o, --output <directory>",
			"output directory for extracted files",
			settings.extractSettings.defaultOutput,
		)
		.option("-v, --verbose", "verbose output")
		.action(
			({
				exclude,
				force,
				input,
				output,
				verbose,
			}: {
				exclude: string[];
				force: boolean;
				input: string;
				output: string;
				verbose: boolean;
				// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
			}) => {
				// Check if input exists, if not throw error
				if (!existsSync(input)) {
					throw new Error("Input directory does not exist");
				}

				consoleTitle(
					verbose
						? `Extracting files: ${input} | Force: ${force} | Output: ${output}`
						: undefined,
				);

				// Get contents of input directory
				const contents = readdirSync(input, {
					withFileTypes: true,
					recursive: true,
				});

				// Flip the contents array to have the deepest files first
				contents.reverse();

				// Set ignore list
				const ignore = [".git", "mp3", "license", ".md", ".txt"]; // "license", ".md", ".txt" temporary fix
				if (exclude) {
					ignore.push(...exclude);
				}

				// Set broken list
				const broken: string[] = [];

				// For each collection, extract
				for (const file of contents) {
					// If on ignore list, skip
					if (
						ignore.some((ignore) =>
							file.name.toLocaleLowerCase().includes(ignore),
						)
					) {
						continue;
					}

					// If file is a directory, create the directory in the output and continue
					if (file.isDirectory()) {
						// createDirectory(join(output, file.name), true);
						continue;
					}

					// Check if file is broken, if so, log and continue
					if (isFileBroken(join(input, file.name))) {
						broken.push(join(input, file.name));
						continue;
					}

					// Extract file
					const { data, error } = useExtractor(input, output, file, force);

					// Handle errors
					if (!data && error) {
						consoleError(error);
					}
					// Handle warnings
					else if (data && error && !force) {
						consoleItem(error);
					}
					// Handle success
					else if (data) {
						consoleItem(`extracted to: ${data}`);
					}
				}

				// Log broken files
				if (broken.length > 0) {
					consoleHeader("Broken files:");

					for (const file of broken) {
						consoleItem(file);
					}
				}

				writeFileSync(
					`${output}/broken-files.json`,
					JSON.stringify(broken, null, 2),
				);
			},
		);

	return command;
}
