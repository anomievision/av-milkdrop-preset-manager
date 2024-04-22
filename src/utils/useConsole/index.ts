import { version } from "../../../package.json";
import type { ExportFormat } from "../../commands/convert/generator";
import {
	writeToDuplicateFile,
	writeToPrimaryFile,
	writeToReviewFile,
} from "./logging";

export const consoleTitle = (input: string, output: string) => {
	const title = `AnomieVision | Milkdrop Preset Manager | Version: ${version}`;

	console.info(title);
	writeToPrimaryFile(title);

	const subtitle = `\nInput: ${input} | Output: ${output}`;
	console.info(subtitle);
	writeToPrimaryFile(subtitle);
};

export const consoleHeader = (preset: string, format: ExportFormat) => {
	const _preset = `\nPreset: ${preset}`;
	const _format = `Format: ${format}`;

	console.info(_preset);
	writeToPrimaryFile(_preset);

	console.info(_format);
	writeToPrimaryFile(_format);
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
	writeToPrimaryFile(_title);

	console.info(_authors);
	writeToPrimaryFile(_authors);

	console.info(_collection);
	writeToPrimaryFile(_collection);

	console.info(_tags);
	writeToPrimaryFile(_tags);

	console.info(_code);
	writeToPrimaryFile(_code);
};

export const consoleStatus = (message: string) => {
	const _message = `Status: ${message}`;

	console.info(_message);
	writeToPrimaryFile(_message);
};

export const reportDuplicate = (message: string) => {
	const _message = `Duplicate: ${message}`;

	writeToDuplicateFile(_message);
};

export const reportReview = (message: string) => {
	const _message = `Review: ${message}`;

	writeToReviewFile(_message);
};
