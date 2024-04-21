import { sep } from "node:path";
import type { BunFile, FileSink } from "bun";

let logFile: string | undefined;
let file: BunFile | undefined;
let writer: FileSink | undefined;

export function initLogging(filePath: string) {
	const timeFormatter = new Intl.DateTimeFormat("en-US", {
		dateStyle: "short",
		timeStyle: "medium",
		timeZone: "America/Chicago",
	});
	const time = timeFormatter
		.format(new Date())
		.replace(/[^a-zA-Z0-9]/g, "-")
		.replace(/--/g, "_");

	logFile = `${filePath}${sep}log_${time}.txt`;
	file = Bun.file(logFile);
	writer = file.writer();
}

export function writeToFile(message: string) {
	if (!writer) {
		return;
	}

	writer.write(`${message}\n`);
}
