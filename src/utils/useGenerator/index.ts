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
): boolean {
	// Add the .json extension
	const _output = `${output}${sep}${fileName}.json`;

	console.info(`Generating file: ${_output}`);

	// Write the file
	writeFileSync(_output, JSON.stringify(data, null, 2));

	// Check if the file was created
	if (!existsSync(_output)) {
		return false;
	}

	return true;
}

function generateMilkdropFile(
	output: string,
	fileName: string,
	data: PresetData,
): boolean {
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

	// Check if the file was created
	if (!existsSync(_output)) {
		return false;
	}

	return true;
}

export function useFileGenerator(
	format: ExportFormat,
	output: string,
	fileName: string,
	data: PresetData,
): boolean {
	// Generate the file based on the format
	switch (format) {
		case "json": {
			return generateJsonFile(output, fileName, data);
		}
		case "milk": {
			return generateMilkdropFile(output, fileName, data);
		}
		default: {
			throw new Error(`Unsupported format: ${format}`);
		}
	}
}
