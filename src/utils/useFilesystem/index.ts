import { execSync } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { parse } from "node:path";

// Check if a file or directory
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

// Check if a program is installed
export function isProgramInstalled(program: string): boolean {
	try {
		execSync(`${program} --version`);
		return true;
	} catch (_error: unknown) {
		return false;
	}
}

// Check if file is broken
export function isFileBroken(file: string): boolean {
	// Test if file exists, if it fails, return true
	try {
		return !existsSync(file);
	} catch (_error: unknown) {
		return true;
	}
}

// Make a directory, if it doesn't exist recursively
export function createDirectory(directory: string, recreate = false): void {
	if (!existsSync(directory)) {
		mkdirSync(directory, { recursive: true });
	} else if (recreate) {
		rmSync(directory, { recursive: true, force: true });
		mkdirSync(directory, { recursive: true });
	}
}

// Copy a file from source to destination, handles making directories if they don't exist
export function copyFile(
	source: string,
	destination: string,
	force = false,
): boolean {
	// Get the directory of the destination
	const { dir } = parse(destination);

	// Create the directory
	createDirectory(dir);

	// Copy the file
	try {
		cpSync(source, destination, {
			force,
			recursive: true,
		});
		return true;
	} catch (_error: unknown) {
		return false;
	}
}

// Read the code from a preset using BunFile
async function useCodeFromBunFile(filePath: string): Promise<string> {
	// Convert filePath to Buffer
	const buffer = Buffer.from(filePath);

	// Read file
	const file = Bun.file(buffer);

	if (!file.exists()) {
		throw new Error(`File does not exist: ${filePath}`);

		// Move for 'Review: Can't open file' error
	}

	let content: string;

	// If filePath contains json, read the file as json else read as text
	if (filePath.endsWith(".json")) {
		content = await file.json();
	} else {
		content = await file.text();
	}

	return content;
}

// Read the code from a preset using readFileSync with BunFile as fallback
export async function useCodeFromFile(filePath: string): Promise<string> {
	// Convert filePath to Buffer
	const buffer = Buffer.from(filePath);

	if (!existsSync(buffer)) {
		return await useCodeFromBunFile(filePath);
	}

	// Read file
	const file = readFileSync(buffer, "utf8");

	let content: string;

	// If filePath contains json, read the file as json else read as text
	if (filePath.endsWith(".json")) {
		const json = JSON.parse(file.toString());
		content = json.code;
	} else {
		content = file.toString();
	}

	return content;
}

export function useFileWriter(filePath: string, content: unknown): void {
	// Parse the file name
	const { dir: directory } = parse(filePath);

	// Check if directory exists
	createDirectory(directory);

	// Write the file
	if (typeof content === "string") {
		writeFileSync(filePath, content);
	} else if (typeof content === "object") {
		writeFileSync(filePath, JSON.stringify(content, null, 2));
	}
}
