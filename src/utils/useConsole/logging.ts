import { existsSync, mkdirSync } from "node:fs";
import { sep } from "node:path";
import type { BunFile, FileSink } from "bun";

let primaryLogFile: string | undefined;
let duplicateLogFile: string | undefined;
let reviewLogFile: string | undefined;

let primaryFile: BunFile | undefined;
let duplicateFile: BunFile | undefined;
let reviewFile: BunFile | undefined;

let primaryWriter: FileSink | undefined;
let duplicateWriter: FileSink | undefined;
let reviewWriter: FileSink | undefined;

export function initLogging(filePath: string) {
	const logDir = `${filePath}${sep}logs`;

	// Make logs directory if it doesn't exist
	if (!existsSync(logDir)) {
		mkdirSync(logDir);
	}

	// Get the current time and format it
	const timeFormatter = new Intl.DateTimeFormat("en-US", {
		dateStyle: "short",
		timeStyle: "medium",
		timeZone: "America/Chicago",
	});
	const time = timeFormatter
		.format(new Date())
		.replace(/[^a-zA-Z0-9]/g, "-")
		.replace(/--/g, "_");

	// Set the log file paths
	primaryLogFile = `${logDir}${sep}log_${time}.txt`;
	duplicateLogFile = `${logDir}${sep}duplicate_${time}.txt`;
	reviewLogFile = `${logDir}${sep}review_${time}.txt`;
}

function initWriter(type: "primary" | "duplicate" | "review") {
	if (type === "primary") {
		if (!primaryLogFile) {
			return;
		}

		primaryFile = Bun.file(primaryLogFile);
		primaryWriter = primaryFile.writer();
	} else if (type === "duplicate") {
		if (!duplicateLogFile) {
			return;
		}

		duplicateFile = Bun.file(duplicateLogFile);
		duplicateWriter = duplicateFile.writer();
	} else {
		if (!reviewLogFile) {
			return;
		}

		reviewFile = Bun.file(reviewLogFile);
		reviewWriter = reviewFile.writer();
	}
}

export function writeToPrimaryFile(message: string) {
	if (!primaryWriter) {
		initWriter("primary");

		if (!primaryWriter) {
			return;
		}
	}

	primaryWriter.write(`${message}\n`);
}

export function writeToDuplicateFile(message: string) {
	if (!duplicateWriter) {
		initWriter("duplicate");

		if (!duplicateWriter) {
			return;
		}
	}

	duplicateWriter.write(`${message}\n`);
}

export function writeToReviewFile(message: string) {
	if (!reviewWriter) {
		initWriter("review");

		if (!reviewWriter) {
			return;
		}
	}

	reviewWriter.write(`${message}\n`);
}
