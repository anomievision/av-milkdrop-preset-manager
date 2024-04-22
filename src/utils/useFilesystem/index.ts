import { readdirSync, statSync } from "node:fs";
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

export function getPresets(path: string): string[] {
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
				if (file.endsWith(".milk") || file.endsWith(".json")) {
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

export async function useCodeFromFile(filePath: string): Promise<string> {
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
