import type { Dirent } from "node:fs";
import { join, parse, sep } from "node:path";
import { copyFile } from "../useFilesystem";

// Convert legacy formats to new formats
function convertLegacyFormats(fileName: string): string {
	const legacyFormats = [
		{
			old: ".prjm",
			new: ".milk",
		},
	];

	if (legacyFormats.some((format) => fileName.endsWith(format.old))) {
		return fileName.replace(legacyFormats[0].old, legacyFormats[0].new);
	}

	return fileName;
}

// Handle .json files
function handleJsonFiles(fileName: string): string {
	if (fileName.toLowerCase().endsWith(".json")) {
		// Parse the file name
		const { dir, name, ext } = parse(fileName);

		// Split the directory into parts
		const dirParts = dir.split(sep);

		// Remove any entries that contain "presets" or "textures"
		const filteredParts = dirParts.filter(
			(part) =>
				!(
					part.toLowerCase().includes("presets") ||
					part.toLowerCase().includes("textures")
				),
		);

		// Add "json" and the name with the extension back to the array
		filteredParts.push("json", `${name}${ext}`);

		// Join the parts back together
		return filteredParts.join(sep);
	}

	return fileName;
}

// Handle .milk files
function handleMilkFiles(fileName: string): string {
	if (fileName.toLowerCase().endsWith(".milk")) {
		// Parse the file name
		const { dir, name, ext } = parse(fileName);

		// Split the directory into parts
		const dirParts = dir.split(sep);

		// Remove any entries that contain "presets" or "textures"
		const filteredParts = dirParts.filter(
			(part) =>
				!(part.toLowerCase().includes("presets") || part.includes("textures")),
		);

		if (filteredParts.length > 1) {
			// Add "presets" and the name with the extension back to the array, after the first part
			filteredParts.splice(1, 0, "presets");
			filteredParts.push(`${name}${ext}`);
		} else {
			// Add "presets" and the name with the extension back to the array
			filteredParts.push("presets", `${name}${ext}`);
		}

		// Join the parts back together
		return filteredParts.join(sep);
	}

	return fileName;
}

// Handle image files
function handleImageFiles(fileName: string): string {
	// Supported image file types
	const supported = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".tga"];

	// Covert art filters
	const coverArtFilters = ["cover", "coverart", "cover-art", "logo"];

	// Parse the file name
	const { dir, name, ext } = parse(fileName);

	// Split the directory into parts
	const dirParts = dir.split(sep);

	// Remove any entries that contain "presets" or "textures"
	const filteredParts = dirParts.filter(
		(part) =>
			!(
				part.toLowerCase().includes("presets") ||
				part.toLowerCase().includes("textures")
			),
	);

	// Handle cover-art or logo
	if (
		// If contains supported extension and cover art filter
		(supported.some((ext) => fileName.toLowerCase().endsWith(ext)) &&
			coverArtFilters.some((filter) =>
				fileName.toLowerCase().includes(filter),
			)) ||
		// If dir and name contain similar strings
		(supported.some((ext) => fileName.toLowerCase().endsWith(ext)) &&
			dirParts.some((part) =>
				part.toLowerCase().includes(name.toLowerCase()),
			) &&
			!name.toLowerCase().includes("project") &&
			!name.toLowerCase().includes("m"))
	) {
		// Add "presets" and the name with the extension back to the array
		filteredParts.push(`${name}${ext}`);

		// Join the parts back together
		return filteredParts.join(sep);
	}

	// Handle textures
	if (
		// If contains supported extension and does not contain cover art filter
		supported.some((ext) => fileName.toLowerCase().endsWith(ext)) &&
		!coverArtFilters.some((filter) => fileName.toLowerCase().includes(filter))
	) {
		// Add "textures" and the name with the extension back to the array
		filteredParts.push("textures", `${name}${ext}`);

		// Join the parts back together
		return filteredParts.join(sep);
	}

	return fileName;
}

// Handle documentation files
function handleDocumentationFiles(fileName: string): string {
	// Filter out files that contain any of the following strings
	const filters = ["license", ".md", ".txt"];

	if (filters.some((filter) => fileName.toLowerCase().includes(filter))) {
		// Parse the file name
		const { dir, name, ext } = parse(fileName);

		// Split the directory into parts
		const dirParts = dir.split(sep);

		// Remove any entries that contain "presets" or "textures"
		const filteredParts = dirParts.filter(
			(part) =>
				!(
					part.toLowerCase().includes("presets") ||
					part.toLowerCase().includes("textures")
				),
		);

		// Add "docs" and the name with the extension back to the array
		filteredParts.push("docs", `${name}${ext}`);

		// Join the parts back together
		return filteredParts.join(sep);
	}

	return fileName;
}

// Handle other files (LICENSE, README, etc.)
function handleOtherFiles(fileName: string): string {
	// Supported file types
	const supported = [
		".json",
		".milk",
		".png",
		".jpg",
		".jpeg",
		".gif",
		".webp",
		".bmp",
		".tga",
	];

	// Check if the file is a supported type, if not move it to the "other" directory
	if (!supported.some((ext) => fileName.toLowerCase().endsWith(ext))) {
		// Parse the file name
		const { dir, name, ext } = parse(fileName);

		// Split the directory into parts
		const dirParts = dir.split(sep);

		// Remove any entries that contain "presets" or "textures"
		const filteredParts = dirParts.filter(
			(part) =>
				!(
					part.toLowerCase().includes("presets") ||
					part.toLowerCase().includes("textures")
				),
		);

		// Add "other" and the name with the extension back to the array
		filteredParts.push("other", `${name}${ext}`);

		// Join the parts back together
		return filteredParts.join(sep);
	}

	return fileName;
}

// Extract and sort files from input to output
export function useExtractor(
	input: string,
	output: string,
	file: Dirent,
	force = false,
): { data: string | undefined; error: string | undefined } {
	// Convert legacy formats to new formats
	let fileName = convertLegacyFormats(file.name);

	// Handle .json files
	fileName = handleJsonFiles(fileName);

	// Handle .milk files
	fileName = handleMilkFiles(fileName);

	// Handle images files
	fileName = handleImageFiles(fileName);

	// Handle documentation files
	fileName = handleDocumentationFiles(fileName);

	// Handle other files
	fileName = handleOtherFiles(fileName);

	const copied = copyFile(
		join(input, file.name),
		join(output, fileName),
		force,
	);

	if (!copied) {
		return { data: undefined, error: `failed to copy file: ${fileName}` };
	}

	return { data: fileName, error: undefined };
}
