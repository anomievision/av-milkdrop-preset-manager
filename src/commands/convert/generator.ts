import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { sep } from "node:path";
import {
	consoleStatus,
	reportDuplicate,
	reportReview,
} from "../../utils/useConsole";
import type { Tests } from "./funcs";

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
	tests: Tests,
): boolean {
	let _output = `${output}`;

	// Modify the output path based on the tests
	if (
		tests.doesFileAlreadyExist &&
		tests.doesExistingFileContentsMatchNewContents
	) {
		consoleStatus(
			"File already exists and the contents are the same. Skipping...",
		);

		reportDuplicate(`${_output}${sep}${fileName}`);
		return false;
	}

	if (
		tests.doesFileAlreadyExist &&
		!tests.doesExistingFileContentsMatchNewContents
	) {
		consoleStatus(
			"File already exists but the contents are different. Moving for review...",
		);

		reportReview(`${_output}${sep}${fileName} - different contents`);

		_output = `${_output}${sep}review`;

		// Make the review directory if it doesn't exist
		if (!existsSync(_output)) {
			mkdirSync(_output);
		}
	}

	if (!tests.hasAuthors) {
		consoleStatus("No authors found. Moving for review...");

		reportReview(`${_output}${sep}${fileName} - no authors`);

		_output = `${_output}${sep}review`;

		// Make the review directory if it doesn't exist
		if (!existsSync(_output)) {
			mkdirSync(_output);
		}
	}

	let success = false;

	// Generate the file based on the format
	switch (format) {
		case "json": {
			success = generateJsonFile(_output, fileName, data);
			break;
		}
		case "milk": {
			success = generateMilkdropFile(_output, fileName, data);
			break;
		}
		default: {
			throw new Error(`Unsupported format: ${format}`);
		}
	}

	return success;
}
