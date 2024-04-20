import { existsSync, writeFileSync } from "node:fs";

export interface PresetData {
	title: string;
	authors: string[];
	tags: string[];
	collection: string;
	code: string;
}

function generateJsonFile(filePath: string, data: PresetData): void {
	// Check if the file exists
	if (existsSync(filePath)) {
		console.warn(`The file <${filePath}> already exists.`);
	}

	console.info(`Writing to <${filePath}>`, data.authors, data.title, data.tags);

	// Write the file
	writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function useFileGenerator(
	format: "json",
	filePath: string,
	data: PresetData,
): void {
	switch (format) {
		case "json": {
			generateJsonFile(`${filePath}.json`, data);
			break;
		}
		default: {
			console.error(`The format <${format}> is not supported.`);
		}
	}
}
