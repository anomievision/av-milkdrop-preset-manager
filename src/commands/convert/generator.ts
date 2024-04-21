import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { sep } from "node:path";

export interface PresetData {
	title: string;
	authors: string[];
	tags: string[];
	collection: string;
	code: string;
}

export type ExportFormat = "json" | "milk";

function generateJsonFile(
	output: string,
	fileName: string,
	data: PresetData,
): void {
	// Add the .json extension
	const _output = `${output}${sep}${fileName}.json`;

	console.info(`Generating file: ${_output}`);

	// Write the file
	writeFileSync(_output, JSON.stringify(data, null, 2));
}

function generateMilkdropFile(
	output: string,
	fileName: string,
	data: PresetData,
): void {
	let _output = output;

	// Add the collection to the output path if it exists
	if (data.collection) {
		_output = `${output}${sep}${data.collection}`;

		if (!existsSync(_output)) {
			mkdirSync(_output);
		}
	}

	// Add the .milk extension
	_output = `${_output}${sep}${fileName}.milk`;

	console.info(`Generating file: ${_output}`);

	// Write the file
	writeFileSync(_output, data.code);
}

export function useFileGenerator(
	format: ExportFormat,
	output: string,
	fileName: string,
	data: PresetData,
): void {
	// Generate the file based on the format
	switch (format) {
		case "json": {
			generateJsonFile(output, fileName, data);
			break;
		}
		case "milk": {
			generateMilkdropFile(output, fileName, data);
			break;
		}
		default: {
			throw new Error(`Unsupported format: ${format}`);
		}
	}
}