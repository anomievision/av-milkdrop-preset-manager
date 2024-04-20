import { existsSync, mkdirSync } from "node:fs";
import { Command } from "commander";
import { getPresets } from "../utils/helpers";
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

			// Get presets from input
			const presets = getPresets(input);

			// Convert each file
			for (const preset of presets) {
				console.info(`Converting <${preset}> to <${format}>`);

				usePresetConverter(preset, output, format);

				console.log();
			}
		});

	return command;
}
