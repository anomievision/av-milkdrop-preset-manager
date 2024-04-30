import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Command } from "commander";
import { settings } from "../../settings";
import { type AnalyzeResults, useJsonAnalyzer } from "../../utils/useAnalyze";
import {
	consoleHeader,
	consoleItem,
	consoleTitle,
} from "../../utils/useConsole";
import { createDirectory, useFileWriter } from "../../utils/useFilesystem";
import { useFileNormalizer } from "../../utils/useNormalize";

export function addNormalize(): Command {
	const command = new Command()
		.command("normalize")
		.description("normalize preset names based on syntax")
		.option("-ig, --ignore-reviews", "ignore presets with reviews")
		.option(
			"-i, --input <path>",
			"input path",
			settings.normalizeSettings.defaultInput,
		)
		.option(
			"-o, --output <path>",
			"output path",
			settings.normalizeSettings.defaultOutput,
		)
		.option("-v, --verbose", "verbose output")
		.option("-w, --write", "write changes to files")
		.option(
			"-dc, --directory-casing <casing>",
			"set directory casing",
			settings.normalizeSettings.defaultDirectoryCasing,
		)
		.option(
			"-dd, --directory-divider <divider>",
			"set directory divider",
			settings.normalizeSettings.defaultDirectoryDivider,
		)
		.option(
			"-ac, --author-casing <casing>",
			"set author casing",
			settings.normalizeSettings.defaultAuthorCasing,
		)
		.option(
			"-ad, --author-divider <divider>",
			"set author divider",
			settings.normalizeSettings.defaultAuthorDivider,
		)
		.option(
			"-as, --author-separator <separator>",
			"set author separator",
			settings.normalizeSettings.defaultAuthorSeparator,
		)
		.option(
			"-cc, --collection-casing <casing>",
			"set collection casing",
			settings.normalizeSettings.defaultCollectionCasing,
		)
		.option(
			"-cd, --collection-divider <divider>",
			"set collection divider",
			settings.normalizeSettings.defaultCollectionDivider,
		)
		.option(
			"-cs, --collection-separator <separator>",
			"set collection separator",
			settings.normalizeSettings.defaultCollectionSeparator,
		)
		.option(
			"-tac, --tag-casing <casing>",
			"set tag casing",
			settings.normalizeSettings.defaultTagCasing,
		)
		.option(
			"-tad, --tag-divider <divider>",
			"set tag divider",
			settings.normalizeSettings.defaultTagDivider,
		)
		.option(
			"-tas, --tag-separator <separator>",
			"set tag separator",
			settings.normalizeSettings.defaultTagSeparator,
		)
		.option(
			"-tc, --title-casing <casing>",
			"set title casing",
			settings.normalizeSettings.defaultTitleCasing,
		)
		.option(
			"-td, --title-divider <divider>",
			"set title divider",
			settings.normalizeSettings.defaultTitleDivider,
		)
		.option(
			"-s, --splitter <splitter>",
			"set author/title splitter",
			settings.normalizeSettings.defaultSplitter,
		)
		.option(
			"-m, --meta-order <order>",
			"set meta order for output filename",
			settings.normalizeSettings.defaultMetaOrder,
		) // "collections,tags,authors,title"
		.action(
			({
				ignoreReviews,
				input,
				output,
				directoryCasing,
				directoryDivider,
				authorCasing,
				authorDivider,
				authorSeparator,
				collectionCasing,
				collectionDivider,
				collectionSeparator,
				tagCasing,
				tagDivider,
				tagSeparator,
				titleCasing,
				titleDivider,
				splitter,
				metaOrder,
				verbose,
				write,
			}: {
				ignoreReviews: boolean;
				input: string;
				output: string;
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
				verbose: boolean;
				write: boolean;
				// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
			}) => {
				// Check if input exists, if not throw error
				if (!existsSync(input)) {
					throw new Error("Input directory does not exist");
				}

				// Check if output exists, if not create it
				createDirectory(output);

				consoleTitle(
					verbose
						? `Normalize presets in ${input} to ${output} with syntax: ${directoryCasing}${directoryDivider}${authorCasing}${authorDivider}${authorSeparator}${collectionCasing}${collectionDivider}${collectionSeparator}${tagCasing}${tagDivider}${tagSeparator}${titleCasing}${titleDivider}${splitter} and meta order: ${metaOrder}`
						: undefined,
				);

				// Setup data to collect

				const updatedCollections: { old: string; new: string }[] = [];
				const updatedPresets: { old: string; new: string }[] = [];
				const updatedTextures: { old: string; new: string }[] = [];
				const updatedCoverImages: { old: string; new: string }[] = [];
				let completedFileCount = 0;
				const completeResults = [];

				// Get contents of the input directory
				const contents = readdirSync(input, {
					withFileTypes: true,
					recursive: true,
				});

				// For each collection, normalize
				for (const file of contents) {
					// Create the input file path
					const inputFile = join(input, file.name);

					// Skip files and directories
					if (
						file.isDirectory() ||
						inputFile.includes("broken-files") ||
						inputFile.includes("results") ||
						inputFile.includes("reviews")
					) {
						continue;
					}

					// Update the file count
					completedFileCount++;

					// Get data from file
					const {
						directory,
						fileName,
						extension,
						type,
						title,
						authors,
						collections,
						tags,
						code,
						reviews,
					} = useJsonAnalyzer(inputFile);

					// Skip files with reviews
					if (ignoreReviews && reviews) {
						continue;
					}

					// Normalize the data
					const {
						newDirectory,
						newFileName,
						newExtension,
						newType,
						newTitle,
						newAuthors,
						newCollections,
						newTags,
						newCode,
					} = useFileNormalizer(
						directory,
						fileName,
						extension,
						type,
						title,
						authors,
						collections,
						tags,
						code || "",
						{
							directoryCasing,
							directoryDivider,
							authorCasing,
							authorDivider,
							authorSeparator,
							collectionCasing,
							collectionDivider,
							collectionSeparator,
							tagCasing,
							tagDivider,
							tagSeparator,
							titleCasing,
							titleDivider,
							splitter,
							metaOrder,
						},
					);

					// Create new file paths
					const oldFilePath = join(input, directory, fileName + extension);
					const newFilePath = join(
						output,
						newDirectory,
						newFileName + newExtension,
					);

					// Add data to updated arrays
					for (const collection of collections) {
						const newCollection = newCollections.join(", ");
						if (collection !== newCollection) {
							updatedCollections.push({ old: collection, new: newCollection });
						}
					}

					if (type === "preset" && fileName !== newFileName) {
						updatedPresets.push({ old: oldFilePath, new: newFilePath });
					}

					if (type === "texture" && fileName !== newFileName) {
						updatedTextures.push({ old: oldFilePath, new: newFilePath });
					}

					if (type === "cover" && fileName !== newFileName) {
						updatedCoverImages.push({ old: oldFilePath, new: newFilePath });
					}

					// Create the result object
					const result: AnalyzeResults = {
						directory: newDirectory,
						fileName: newFileName,
						extension: newExtension,
						type: newType,
						title: newTitle,
						authors: newAuthors,
						collections: newCollections,
						tags: newTags,
						code: newCode,
						reviews,
						extra: {
							originalFileName: fileName,
						},
					};

					// Add the result to completeResults
					completeResults.push(result);

					// Log the result
					if (verbose) {
						// Result without the code
						const resultWithoutCode = { ...result };
						resultWithoutCode.code = undefined;
						console.info(resultWithoutCode);
					}

					// Write to file, if enabled
					if (write) {
						for (const collection of collections) {
							useFileWriter(
								join(output, collection, `${newFileName}.json`),
								result,
							);
						}
					}
				}

				// Log the results
				consoleHeader("Normalization complete:");
				consoleItem(`Updated Collections: ${updatedCollections.length}`);
				consoleItem(`Updated Presets: ${updatedPresets.length}`);
				consoleItem(`Updated Textures: ${updatedTextures.length}`);
				consoleItem(`Updated Cover Images: ${updatedCoverImages.length}`);

				if (ignoreReviews) {
					consoleItem(
						`Ignored Reviews: ${completedFileCount - completeResults.length}`,
					);
				}

				// Write to file, if enabled
				if (write) {
					useFileWriter(join(output, "results.json"), completeResults);
				}
			},
		);

	return command;
}
