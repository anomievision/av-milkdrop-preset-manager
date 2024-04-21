import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { normalizeText } from "normalize-text";
import { checkIfDirOrFile } from "../../utils/useFilesystem";
import { type ExportFormat, useFileGenerator } from "./generator";

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

export function getDataFromPresetPath(path: string): {
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

export function useNameAnalyzer(name: string): {
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
		// console.log("Separator: ' - '");

		const authorsPart = title.substring(0, separatorIndex);
		title = title.substring(separatorIndex + 3); // +3 to skip the " - "
		authors = authorsPart.split(/[+&,]/).map((author) => author.trim());
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

export function useCodeFromFile(filePath: string): string {
	// Read the file
	const file = readFileSync(filePath, "utf-8");

	// Remove everything before [preset00]  (except [preset00])
	const code = file.substring(file.indexOf("[preset00]"));

	return code;
}

export function usePresetConverter(
	file: string,
	output: string,
	format: ExportFormat,
) {
	// Get name from file path
	const { name, collection, tags } = getDataFromPresetPath(file);

	console.info(`Name: ${name} | Collection: ${collection} | Tags: ${tags}`);

	// Analayze name and get new data
	const { title, authors, fileName } = useNameAnalyzer(name);

	console.info(`Title: ${title} | Authors: ${authors} | FileName: ${fileName}`);

	// Get code from file
	const code = useCodeFromFile(file);

	if (code.length > 0) {
		console.info("Code:", true);
	}

	// Generate the file
	useFileGenerator(format, output, fileName, {
		title,
		authors,
		collection,
		tags,
		code,
	});
}
