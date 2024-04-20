import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export function checkIfDirOrFile(path: string): "file" | "dir" {
	// Check if input is a file or directory
	const stats = statSync(path, { throwIfNoEntry: false });

	if (stats?.isFile()) {
		return "file";
	}

	if (stats?.isDirectory()) {
		return "dir";
	}

	throw new Error("Invalid path");
}

export function getFiles(path: string) {
	const type = checkIfDirOrFile(path);

	switch (type) {
		case "file": {
			return [path];
		}
		case "dir": {
			const files = [];
			const dir = readdirSync(path);

			for (const file of dir) {
				if (file.endsWith(".milk")) {
					files.push(join(path, file));
				}
			}

			return files;
		}

		default: {
			throw new Error("Invalid path");
		}
	}
}

export function getNameFromFilePath(filePath: string): string {
	let fileName: string | undefined;

	if (filePath.includes("/")) {
		fileName = filePath.split("/").pop();
	} else {
		fileName = filePath.split("\\").pop();
	}

	if (!fileName) {
		throw new Error("Invalid file path");
	}

	// Remove the .milk extension
	const name = fileName.replace(".milk", "");

	return name;
}

export function useNameAnalyzer(name: string): {
	authors: string[];
	fileName: string;
	newName: string;
} {
	let authors: string[] = [];
	let newName = "";
	let authorsPart = "";
	let namePart = "";

	// Separate the authors from the name, by the first - surrounded by whitespace.
	if (name.includes("-")) {
		[authorsPart, namePart] = name.split(/(?<=\s)-(?=\s)/);
		// Separate the authors from the name, by the first _
	} else if (name.includes("_")) {
		[authorsPart, namePart] = name.split("_");
	}

	// Extract the authors from the authors part using the separators: +&, and remove any whitespace
	if (authorsPart) {
		authors = authorsPart.split(/[+&,]/).map((author) => author.trim());
	}

	// Remove the authors part from the name
	newName = namePart.trim();

	// Remove .milk extension
	newName = newName.replace(".milk", "");

	// Lowercase the new name
	// newName = newName.toLowerCase();

	return {
		authors,
		fileName: `${newName}.json`,
		newName,
	};
}

export function useCodeFromFile(filePath: string): string {
	// Read the file
	const file = readFileSync(filePath, "utf-8");

	// Remove everything before [preset00]  (except [preset00])
	const code = file.substring(file.indexOf("[preset00]"));

	return code;
}

export function useTagsGenerator(_code: string): string[] {
	const tags: string[] = [];

	// Analayser code

	return tags;
}
