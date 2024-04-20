import { join } from "node:path";
import { useFileGenerator } from "./file";
import {
	getDataFromPresetPath,
	useCodeFromFile,
	useNameAnalyzer,
} from "./helpers";

export function usePresetConverter(
	file: string,
	output: string,
	format: "json",
) {
	// Get name from file path
	const { name, collection, tags } = getDataFromPresetPath(file);

	// Analayze name and get new data
	const { title, authors, fileName } = useNameAnalyzer(name);

	// Get code from file
	const code = useCodeFromFile(file);

	// Generate output file path
	const outputPath = join(output, fileName);

	// Generate the file
	useFileGenerator(format, outputPath, {
		title,
		authors,
		collection,
		tags,
		code,
	});
}
