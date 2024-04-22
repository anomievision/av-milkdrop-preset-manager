import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, sep } from "node:path";
import { normalizeText } from "normalize-text";
import { consoleEntry } from "../../utils/useConsole";
import { checkIfDirOrFile } from "../../utils/useFilesystem";
import {
	type ExportFormat,
	type PresetData,
	useFileGenerator,
} from "./generator";

export function getPresets(path: string) {
	const type = checkIfDirOrFile(path);

	switch (type) {
		case "file": {
			return [path];
		}
		case "dir": {
			let files: string[] = [];
			const dir = readdirSync(path);

			for (const file of dir) {
				const filePath = join(path, file);
				if (file.endsWith(".milk")) {
					files.push(filePath);
				} else {
					const nestedFiles = getPresets(filePath);
					files = files.concat(nestedFiles);
				}
			}

			return files;
		}
		default: {
			throw new Error("Invalid path");
		}
	}
}

function getDataFromPresetPath(path: string): {
	name: string;
	collection: string;
	tags: string[];
} {
	// Remove the .milk extension
	const _path = path.replace(".milk", "");

	// Split the file path into an array of directories and the file name
	let parts: string[];

	if (path.includes("/")) {
		parts = _path.split("/");
	} else {
		parts = _path.split("\\");
	}

	if (!parts) {
		throw new Error("Invalid file path");
	}

	// Remove the first part (the directory path)
	parts.shift();

	// Get the last part and set as name
	const name = parts.pop() || "";

	// Set the collection as the directory name
	const collection = parts.shift() || "";

	// Set the remaining parts as tags
	const tags = parts;

	return {
		name,
		collection,
		tags,
	};
}

function useNameAnalyzer(name: string): {
	title: string;
	authors: string[];
	fileName: string;
} {
	// Remove '.milk' extension
	const _name = name.replace(".milk", "");

	let title: string;
	let authors: string[] = [];

	// Remove '.milk' extension
	title = _name.replace(".milk", "");

	// Separate authors from title
	const separatorIndex = title.indexOf(" - ");
	if (separatorIndex !== -1) {
		const authorsPart = title.substring(0, separatorIndex);
		title = title.substring(separatorIndex + 3); // +3 to skip the " - "
		authors = authorsPart.split(/[+&,]/).map((author) => author.trim());

		// Remove 'vs, 'and', ' n ' from authors
		authors = authors.map((author) =>
			author.replace(/( vs | and | n )\.?/gi, "").trim(),
		);

		// Swap spaces and underscores with - in authors
		authors = authors.map((author) => author.replace(/[\s_]+/g, "-"));

		// Remove all '.' and '=' from authors
		authors = authors.map((author) => author.replace(/[.=]+/g, ""));
	} else {
		title = _name;
	}

	// Remove all special characters from the title
	title = normalizeText(title);

	// Replace all spaces and underscores with hyphens, replace all triple hyphens with single hyphens
	title = title.replace(/[\s_]+/g, "-").replace(/---/g, "-");

	// Combine the authors and title to create the file name
	const fileName = `${authors.join("+")}_${title}`.toLowerCase();

	return {
		title,
		authors,
		fileName,
	};
}

async function useCodeFromFile(filePath: string): Promise<string> {
	// If filePath contains json, read the file as json else read as text
	let text: string;

	if (filePath.endsWith(".json")) {
		const file = await Bun.file(filePath).json();
		text = file.code;
	} else {
		text = await Bun.file(filePath).text();
	}

	// Remove everything before [preset00]  (except [preset00])
	text = text.substring(text.indexOf("[preset00]"));

	return text;
}

export interface Tests {
	doesFileAlreadyExist: boolean;
	doesExistingFileContentsMatchNewContents?: boolean;
	hasAuthors: boolean;
}

async function usePresetTester(
	output: string,
	format: ExportFormat,
	fileName: string,
	data: PresetData,
): Promise<Tests> {
	// Build the output path
	let _output = output;

	switch (format) {
		case "json": {
			_output = `${output}${sep}${fileName}.json`;
			break;
		}
		case "milk": {
			if (data.collection) {
				_output = `${_output}${sep}${data.collection}`;
			}

			_output = `${_output}${sep}${fileName}.milk`;
			break;
		}
		default: {
			throw new Error("Invalid format");
		}
	}

	// Check if the file already exists
	const doesFileAlreadyExist = existsSync(_output);
	let doesExistingFileContentsMatchNewContents: boolean | undefined = undefined;
	const hasAuthors = data.authors.length > 0;

	// If the file already exists, check if the contents are the same
	if (doesFileAlreadyExist) {
		const existingFile = await useCodeFromFile(_output);
		const newFile = data.code;

		// Check if the contents are the same
		if (existingFile.length === newFile.length) {
			doesExistingFileContentsMatchNewContents = true;
		} else {
			doesExistingFileContentsMatchNewContents = false;
		}
	}

	return {
		doesFileAlreadyExist,
		doesExistingFileContentsMatchNewContents,
		hasAuthors,
	};
}

export async function usePresetConverter(
	output: string,
	format: ExportFormat,
	file: string,
): Promise<void> {
	const _output = `${output}${sep}presets`;

	// Make the presets directory if it doesn't exist
	if (!existsSync(_output)) {
		mkdirSync(_output);
	}

	// Get name from file path
	const { name, collection, tags } = getDataFromPresetPath(file);

	// Analayze name and get new data
	const { title, authors, fileName } = useNameAnalyzer(name);

	// Get code from file
	const code = await useCodeFromFile(file);

	consoleEntry(
		title,
		authors.join(", "),
		collection,
		tags.join(", "),
		code.length > 0,
	);

	// Test the preset
	const tests = await usePresetTester(_output, format, fileName, {
		title,
		authors,
		collection,
		tags,
		code,
	});

	// Generate the file
	useFileGenerator(
		format,
		_output,
		fileName,
		{
			title,
			authors,
			collection,
			tags,
			code,
		},
		tests,
	);
}
