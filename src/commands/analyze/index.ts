import { existsSync, mkdirSync } from "node:fs";
import { Command } from "commander";
import {
	consoleHeader,
	consoleMessage,
	consoleStatus,
	consoleTitle,
} from "../../utils/useConsole";
import { initLogging } from "../../utils/useConsole/logging";
import { getPresets } from "../../utils/useFilesystem";
import type { ExportFormat } from "../../utils/useGenerator";
import { findDuplicatePresets } from "./funcs";

export function addAnalyze(): Command {
	const command = new Command()
		.command("analyze")
		.description("analyze presets for issues")
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

				consoleMessage("\nAnalyzing presets...");

				// Analyze and compare each file against all other files in the directory
				for (const preset of presets) {
					const result = await findDuplicatePresets(preset, presets);

					if (result.length > 0) {
						consoleHeader(preset, format);
						consoleStatus(`Duplicates found: ${result}`);
					}
				}

				consoleMessage("\nAnalysis complete");
			},
		);

	return command;
}
