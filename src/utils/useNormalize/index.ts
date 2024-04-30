import { sep } from "node:path";
import type { AnalyzeFileType } from "../useAnalyze";

// Convert the input to the specified casing
function toCasing(input: string, casing: string): string {
	switch (casing) {
		case "lower":
			return input.toLowerCase();
		case "upper":
			return input.toUpperCase();
		case "title":
			return input.replace(/\b\w/g, (char) => char.toUpperCase());
		default:
			return input;
	}
}

// Santize the input by removing unwanted characters
function sanitizeSpaces(input: string, divider: string): string {
	return input
		.replace(/[^a-zA-Z0-9\s'(){}[]]/g, divider)
		.replace(/['’]+/g, "")
		.replace(/[_ -]+/g, divider)
		.replace(/\s/g, divider);
}

// Normalize the directory and return the new data
function normalizeDirectory(
	directory: string,
	directoryCasing: string,
	directoryDivider: string,
): string {
	// If the directory is empty, return an empty string
	if (directory === "") {
		return "";
	}

	const _directory = directory.split(sep);

	// Normalize the directory
	for (let i = 0; i < _directory.length; i++) {
		// Set the casing
		_directory[i] = toCasing(_directory[i], directoryCasing);

		// Replace spaces the divider
		_directory[i] = sanitizeSpaces(_directory[i], directoryDivider);
	}

	return _directory.join(sep);
}

// Normalize the file name and return the new data
function normalizeFileName(
	fileName: string,
	title: string,
	authors: string[],
	collections: string[],
	tags: string[],
	metaOrder: string[],
	authorSeparator: string,
	collectionSeparator: string,
	tagSeparator: string,
	splitter: string,
): string {
	// If the file name is empty, return an empty string
	if (fileName === "") {
		return "";
	}

	// Construct the new file name based on the meta order
	let newFileName = "";

	for (const meta of metaOrder) {
		switch (meta) {
			case "title": {
				newFileName += title + splitter;
				break;
			}
			case "authors": {
				newFileName += authors.join(authorSeparator) + splitter;
				break;
			}
			case "collections": {
				newFileName += collections.join(collectionSeparator) + splitter;
				break;
			}
			case "tags": {
				newFileName += tags.join(tagSeparator) + splitter;
				break;
			}
			default:
				break;
		}
	}

	// Remove the trailing splitter
	if (newFileName.endsWith(splitter)) {
		newFileName = newFileName.slice(0, -splitter.length);
	}

	return newFileName;
}

// Normalize the extension and return the new data
function normalizeExtension(extension: string): string {
	// If the extension is empty, return an empty string
	if (extension === "") {
		return "";
	}

	return extension.toLowerCase();
}

// Normalize the type and return the new data
function normalizeType(type: AnalyzeFileType): AnalyzeFileType {
	return type.toString().toLowerCase() as AnalyzeFileType;
}

// Normalize the title and return the new data
function normalizeTitle(
	title: string,
	titleCasing: string,
	titleDivider: string,
): string {
	// If the title is empty, return an empty string
	if (title === "") {
		return "";
	}

	let _title = title;

	// Add a space between title case words
	_title = _title.replace(/([a-z])([A-Z])/g, "$1 $2");

	// Set the casing
	_title = toCasing(_title, titleCasing);

	// Add a space before ( if a space is not present and Add a space after ) if a space is not present and not at the end
	_title = _title.replace(/(\S)\(/g, "$1 (").replace(/\)(\S)/g, ") $1");

	// Add a space before [ if a space is not present and Add a space after ] if a space is not present and not at the end
	_title = _title.replace(/(\S)\[/g, "$1 [").replace(/\](\S)/g, "] $1");

	// Replace spaces with the divider
	_title = sanitizeSpaces(_title, titleDivider);

	return _title;
}

// Normalize the authors and return the new data
function normalizeAuthors(
	authors: string[],
	authorCasing: string,
	authorDivider: string,
): string[] {
	// If the authors are empty, return an empty array
	if (authors.length === 0) {
		return [];
	}

	const _authors = authors;

	for (let i = 0; i < _authors.length; i++) {
		// Set the casing
		_authors[i] = toCasing(_authors[i], authorCasing);

		// Replace spaces with the divider
		_authors[i] = sanitizeSpaces(_authors[i], authorDivider);
	}

	return _authors;
}

// Normalize the collection and return the new data
function normalizeCollection(
	collections: string[],
	collectionCasing: string,
	collectionDivider: string,
): string[] {
	// If the collections are empty, return an empty array
	if (collections.length === 0) {
		return [];
	}

	const _collections = collections.map((collection) =>
		toCasing(collection, collectionCasing),
	);

	for (let i = 0; i < _collections.length; i++) {
		// Set the casing
		_collections[i] = toCasing(_collections[i], collectionCasing);

		// Replace spaces with the divider
		_collections[i] = sanitizeSpaces(_collections[i], collectionDivider);
	}

	return _collections;
}

// Normalize the tags and return the new data
function normalizeTags(
	tags: string[],
	tagCasing: string,
	tagDivider: string,
): string[] {
	// If the tags are empty, return an empty array
	if (tags.length === 0) {
		return [];
	}

	const _tags = tags;

	for (let i = 0; i < _tags.length; i++) {
		// Set the casing
		_tags[i] = toCasing(_tags[i], tagCasing);

		// Replace spaces with the divider
		_tags[i] = sanitizeSpaces(_tags[i], tagDivider);
	}

	return _tags;
}

// Normalize the code and return the new data
function normalizeCode(code: string): string {
	// If the code is empty, return an empty string
	if (code === "") {
		return "";
	}

	return code;
}

// Normalize the file and return the new data
export function useFileNormalizer(
	directory: string,
	fileName: string,
	extension: string,
	type: AnalyzeFileType,
	title: string,
	authors: string[],
	collections: string[],
	tags: string[],
	code: string,
	options: {
		directoryCasing: string;
		directoryDivider: string;
		authorCasing: string;
		authorDivider: string;
		authorSeparator: string;
		collectionCasing: string;
		collectionDivider: string;
		collectionSeparator: string;
		tagCasing: string;
		tagDivider: string;
		tagSeparator: string;
		titleCasing: string;
		titleDivider: string;
		splitter: string;
		metaOrder: string;
	},
): {
	newDirectory: string;
	newFileName: string;
	newExtension: string;
	newType: AnalyzeFileType;
	newTitle: string;
	newAuthors: string[];
	newCollections: string[];
	newTags: string[];
	newCode: string;
} {
	// Set the new directory
	const newDirectory = normalizeDirectory(
		directory,
		options.directoryCasing,
		options.directoryDivider,
	);

	// Set the new extension
	const newExtension = normalizeExtension(extension);

	// Set the new type
	const newType = normalizeType(type);

	// Set the new title
	const newTitle = normalizeTitle(
		title,
		options.titleCasing,
		options.titleDivider,
	);

	// Set the new authors
	const newAuthors = normalizeAuthors(
		authors,
		options.authorCasing,
		options.authorDivider,
	);

	// Set the new collection
	const newCollections = normalizeCollection(
		collections,
		options.collectionCasing,
		options.collectionDivider,
	);

	// Set the new tags
	const newTags = normalizeTags(tags, options.tagCasing, options.tagDivider);

	// Set the new file name (set last to use the new meta order)
	const newFileName = normalizeFileName(
		fileName,
		newTitle,
		newAuthors,
		newCollections,
		newTags,
		options.metaOrder.split(","),
		options.authorSeparator,
		options.collectionSeparator,
		options.tagSeparator,
		options.splitter,
	);

	// Set the new code
	const newCode = normalizeCode(code);

	return {
		newDirectory,
		newFileName,
		newExtension,
		newType,
		newTitle,
		newAuthors,
		newCollections,
		newTags,
		newCode,
	};
}
