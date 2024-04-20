import { existsSync, mkdirSync } from "node:fs";
import { Command } from "commander";
import { getFiles } from "../utils/helpers";
import { usePresetConverter } from "../utils/tasks";

export function addConvert(): Command {
	const command = new Command()
		.command("convert")
		.description("Convert presets to a different format")
		.argument("<input>", "the preset or directory of presets to convert")
		.argument("[output]", "the directory to output the converted presets to")
		.option("-f, --format", "the format to convert to", "json")
		.action((input: string, output: string, { format }: { format: "json" }) => {
			// Check if input exists
			if (!existsSync(input)) {
				console.error("Preset or directory does not exist");
				return;
			}

			// Check if output exists
			if (!existsSync(output)) {
				console.info(`Creating output directory at <${output}>`);
				mkdirSync(output);
			}

			// Get files from input
			const files = getFiles(input);

			// Convert each file
			for (const file of files) {
				console.info(`Converting <${file}> to <${format}>`);

				usePresetConverter(file, output, format);
			}
		});

	return command;
}
