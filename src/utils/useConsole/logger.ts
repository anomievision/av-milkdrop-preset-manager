import { sep } from "node:path";
import type { BunFile, FileSink } from "bun";
import { createDirectory } from "../useFilesystem";

let logDir: string;
const logFiles: Record<string, BunFile> = {};
const writers: Record<string, FileSink> = {};

// Initialize logging
export function initLogging(filePath: string) {
	logDir = `${filePath}${sep}logs`;

	createDirectory(logDir);
}

// Initialize the writer
function initWriter(type: string) {
	if (!logDir) {
		throw new Error("Log directory not initialized");
	}

	const timeFormatter = new Intl.DateTimeFormat("en-US", {
		dateStyle: "short",
		timeStyle: "medium",
		timeZone: "America/Chicago",
	});
	const time = timeFormatter
		.format(new Date())
		.replace(/[^a-zA-Z0-9]/g, "-")
		.replace(/--/g, "_");

	const logFile = `${logDir}${sep}${type}_${time}.txt`;
	logFiles[type] = Bun.file(logFile);
	writers[type] = logFiles[type].writer();
}

// Write to the log file
export function writeToLogFile(type: string, message: string) {
	if (!writers[type]) {
		initWriter(type);

		if (!writers[type]) {
			return;
		}
	}

	writers[type].write(`${message}\n`);
}
