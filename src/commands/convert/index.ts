import { existsSync, mkdirSync } from "node:fs";
import { Command } from "commander";
import { consoleHeader, consoleTitle } from "../../utils/useConsole";
import { initLogging } from "../../utils/useConsole/logging";
import { getPresets } from "../../utils/useFilesystem";
import type { ExportFormat } from "../../utils/useGenerator";
import { usePresetConverter } from "./funcs";

export function addConvert(): Command {
	const command = new Command()
		.command("convert")
		.description("convert presets to a different format")
		.argument("<input>", "the preset or directory of presets to convert")
		.argument("[output]", "the directory to output the converted presets to")
		.option("-f, --format <type>", "the format to convert to", "json")
		.action(
			async (
				input: string,
				output: string,
				{ format }: { format: ExportFormat },
			) => {
				// Check if input exists
				if (!existsSync(input)) {
					console.error("Preset or directory does not exist");
					return;
				}

				// Check if output exists
				if (!existsSync(output)) {
					mkdirSync(output);
				}

				initLogging(output);

				consoleTitle(input, output);

				// Get presets from input
				const presets = getPresets(input);

				// Convert each file
				for (const preset of presets) {
					consoleHeader(preset, format);

					await usePresetConverter(output, format, preset);

					console.info();
				}
			},
		);

	return command;
}
