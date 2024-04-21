import { version } from "../../../package.json";
import type { ExportFormat } from "../../commands/convert/generator";
import { writeToFile } from "./logging";

export const consoleTitle = (input: string, output: string) => {
	const title = `AnomieVision | Milkdrop Preset Manager | Version: ${version}`;

	console.info(title);
	writeToFile(title);

	const subtitle = `\nInput: ${input} | Output: ${output}`;
	console.info(subtitle);
	writeToFile(subtitle);
};

export const consoleHeader = (preset: string, format: ExportFormat) => {
	const _preset = `\nPreset: ${preset}`;
	const _format = `Format: ${format}`;

	console.info(_preset);
	writeToFile(_preset);

	console.info(_format);
	writeToFile(_format);
};

export const consoleEntry = (
	title: string,
	authors: string,
	collection: string,
	tags: string,
	code: boolean,
) => {
	const _title = `Title: ${title}`;
	const _authors = `Authors: ${authors}`;
	const _collection = `Collection: ${collection}`;
	const _tags = `Tags: ${tags}`;
	const _code = `Code: ${code}`;

	console.info(_title);
	writeToFile(_title);

	console.info(_authors);
	writeToFile(_authors);

	console.info(_collection);
	writeToFile(_collection);

	console.info(_tags);
	writeToFile(_tags);

	console.info(_code);
	writeToFile(_code);
};

export const consoleStatus = (message: string) => {
	const _message = `Status: ${message}`;

	console.info(_message);
	writeToFile(_message);
};
