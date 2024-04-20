import { join } from "node:path";
import { useFileGenerator } from "./file";
import {
	getNameFromFilePath,
	useCodeFromFile,
	useNameAnalyzer,
	useTagsGenerator,
} from "./helpers";

export function usePresetConverter(
	file: string,
	output: string,
	format: "json",
) {
	// Get only the file name
	const origName = getNameFromFilePath(file);

	// Analayze name and get new data
	const { authors, fileName, newName } = useNameAnalyzer(origName);

	// Get code from file
	const code = useCodeFromFile(file);

	// Generate tags
	const tags: string[] = useTagsGenerator(code);

	// Generate the file
	useFileGenerator(format, join(output, fileName), {
		name: newName,
		authors,
		tags,
		code,
	});
}
