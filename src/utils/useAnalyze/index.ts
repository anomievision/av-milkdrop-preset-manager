import { readFileSync } from "node:fs";
import { join, parse, sep } from "node:path";
import { settings } from "../../settings";
import { useCodeFromFile } from "../useFilesystem";

export type AnalyzeFileType = "cover" | "preset" | "texture" | "other";

export interface AnalyzeFilePath {
	directory: string;
	fileName: string;
	extension: string;
	type: AnalyzeFileType;
	title: string;
	authors: string[];
	collections: string[];
	tags: string[];
}

export interface AnalyzeFile extends AnalyzeFilePath {
	code?: string;
	extra?: {
		originalFileName?: string;
		[key: string]: string | undefined;
	};
}

export interface AnalyzeReview {
	issue: string;
	fileName: string;
	type: AnalyzeFileType;
	duplicates?: {
		filePath: string;
		type: string;
	}[];
}

export interface AnalyzeResults extends AnalyzeFile {
	reviews?: AnalyzeReview[];
}

export interface PresetFile {
	title: string;
	authors: string[];
	collections: string[];
	tags: string[];
	code?: string;
	extra?: {
		originalFileName?: string;
		[key: string]: string | undefined;
	};
}

// Check if the file needs to be reviewed based on certain conditions
function checkForReview(
	fileName: string,
	type: AnalyzeFileType,
): AnalyzeReview | undefined {
	const reviewTypes = [
		{
			issue: "invalid-symbols-in-filename",
			conditions: [
				// File name contains certain characters
				fileName.includes("---"),
				fileName.includes("+++"),
				fileName.includes("==="),
			],
		},
		{
			issue: "has-long-filename",
			conditions: [
				// File name is too long
				fileName.length >= settings.analyzeSettings.maxLongNameLength,
			],
		},
		{
			issue: "missing-open/close-brackets",
			conditions: [
				// File name is missing open/close brackets
				fileName.includes("(") && !fileName.includes(")"),
				fileName.includes("[") && !fileName.includes("]"),
				fileName.includes("{") && !fileName.includes("}"),
				fileName.includes(")") && !fileName.includes("("),
				fileName.includes("]") && !fileName.includes("["),
				fileName.includes("}") && !fileName.includes("{"),
			],
		},
	];

	// Loop over review types
	for (const reviewType of reviewTypes) {
		// Check for conditions
		if (reviewType.conditions.some((condition) => condition)) {
			return {
				issue: reviewType.issue,
				fileName,
				type,
			};
		}
	}

	// Return undefined if no review needed
	return undefined;
}

// Parse the file name
function parseFileName(fileName: string): { title: string; authors: string[] } {
	if (fileName.length === 0) {
		return {
			title: "",
			authors: [],
		};
	}

	let separatorIndex = -1;
	let deletSpaces = 0;

	if (fileName.includes(" - ")) {
		separatorIndex = fileName.lastIndexOf(" - ");
		deletSpaces = 3;
	} else if (
		fileName.includes("-") &&
		fileName.indexOf("-") === fileName.lastIndexOf("-")
	) {
		separatorIndex = fileName.indexOf("-");
		deletSpaces = 1;
	}

	let title = "";
	let authors: string[] = [];

	if (separatorIndex === -1) {
		return {
			title,
			authors,
		};
	}

	const authorsPart = fileName.substring(0, separatorIndex);
	title = fileName.substring(separatorIndex + deletSpaces);
	authors = authorsPart.split(/[+&,]/).map((author) => author.trim());

	return {
		title,
		authors,
	};
}

// Parse the file path
function parseFilePath(
	inputDir: string,
	filePath: string,
): {
	title: string;
	authors: string[];
	collection: string;
	tags: string[];
} {
	// Remove input directory from the file path
	const _filePath = filePath.replace(`${inputDir}${sep}`, "");

	// Split the file path
	const filePathParts = _filePath.split(sep);

	// Get the collection
	const collection =
		filePathParts.length > 1 ? filePathParts.shift() || "" : "";

	// Get the file name
	const fileName = filePathParts.pop() || "";

	// Get the tags
	const removeWords: string[] = ["presets", "textures"];
	const tags =
		filePathParts.length > 2
			? filePathParts.filter((tag) => !removeWords.includes(tag.toLowerCase()))
			: [];

	// Get the title and authors from the file name
	const { title, authors } = parseFileName(fileName);

	return {
		title,
		authors,
		collection,
		tags,
	};
}

// Get the type of file
function getType(
	directory: string,
	fileName: string,
	extension: string,
): AnalyzeFileType {
	// Covert art filters
	const coverArtFilters = ["cover", "coverart", "cover-art", "logo"];

	// Switch on the extension
	switch (extension.toLowerCase()) {
		case ".milk": {
			return "preset";
		}
		case ".json": {
			return "preset";
		}
		case ".png":
		case ".jpg":
		case ".jpeg":
		case ".gif":
		case ".webp":
		case ".bmp":
		case ".tga": {
			const dirParts = directory.split(sep);

			if (
				coverArtFilters.some((filter) =>
					fileName.toLowerCase().includes(filter),
				) ||
				(dirParts.some((part) =>
					part.toLowerCase().includes(fileName.toLowerCase()),
				) &&
					!(
						fileName.toLowerCase().includes("project") ||
						fileName.toLowerCase().includes("m")
					))
			) {
				return "cover";
			}

			return "texture";
		}
		default: {
			return "other";
		}
	}
}

// Analyze the file and return the data
export async function useFileAnalyzer(
	input: string,
	file: string,
	includeCode = false,
): Promise<{ data?: AnalyzeResults; error?: string }> {
	// Parse the file name
	const { dir: directory, name: fileName, ext: extension } = parse(file);

	// Set the type
	const type = getType(directory, fileName, extension);

	// Check for review
	let reviews: AnalyzeReview[] | undefined = undefined;
	const review = checkForReview(fileName, type);
	if (review !== undefined) {
		reviews = [review];
	}

	// Parse the file path
	const { title, authors, collection, tags } = parseFilePath(
		input,
		join(directory, fileName),
	);

	// Get the code
	let code: string | undefined = undefined;

	if (includeCode) {
		code = await useCodeFromFile(file);
	}

	return {
		data: {
			directory,
			fileName,
			extension,
			type,
			title,
			authors,
			collections: [collection],
			tags,
			code,
			reviews,
		},
	};
}

// Analyze the results.json file and return the data
// export function useJsonResultsAnalyzer(
// 	file: string,
// 	includeCode = false,
// ): AnalyzeResults[] {
// 	// Read the file
// 	const contents = readFileSync(file, "utf-8");

// 	// Parse the json
// 	const json = JSON.parse(contents) as AnalyzeResults[];

// 	// Check if code should be included
// 	if (!includeCode) {
// 		for (const result of json) {
// 			result.code = undefined;
// 		}
// 	}

// 	return json;
// }

// Analyze the json file and return the data
export function useJsonAnalyzer(
	file: string,
	includeCode = false,
): AnalyzeResults {
	// Read the file
	const contents = readFileSync(file, "utf-8");

	// Parse the json
	const json = JSON.parse(contents) as AnalyzeResults;

	// Check if code should be included
	if (!includeCode) {
		json.code = undefined;
	}

	return json;
}

// Find duplicates in the data
export function useDuplicateTester(data: AnalyzeResults[]): AnalyzeResults[] {
	// Loop over the data
	for (const result of data) {
		const matches = [];

		// Check for duplicates
		for (const _result of data) {
			// Skip the same file
			if (result.fileName === _result.fileName) {
				continue;
			}

			if (result.code === _result.code) {
				matches.push({
					filePath: join(_result.directory, _result.fileName),
					type: _result.type,
				});
			}
		}

		// Update reviews with duplicates
		if (matches.length > 0) {
			if (!result.reviews) {
				result.reviews = [];
			}
			result.reviews.push({
				issue: "duplicate-code-found",
				fileName: result.fileName,
				type: result.type,
				duplicates: matches,
			});
		}
	}

	// Return data with updated reviews
	return data;
}
