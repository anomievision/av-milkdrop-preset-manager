import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Command } from "commander";
import { settings } from "../../settings";
import {
	type AnalyzeResults,
	useDuplicateTester,
	useFileAnalyzer,
} from "../../utils/useAnalyze";
import {
	consoleError,
	consoleHeader,
	consoleItem,
	consoleTitle,
} from "../../utils/useConsole";
import {
	createDirectory,
	isFileBroken,
	useFileWriter,
} from "../../utils/useFilesystem";

export function addAnalyze(): Command {
	const command = new Command()
		.command("analyze")
		.description("analyze and sort presets")
		.option("-d, --duplicates", "find and remove duplicate presets")
		.option(
			"-i, --input <directory>",
			"input directory",
			settings.analyzeSettings.defaultInput,
		)
		.option(
			"-o, --output <directory>",
			"output directory",
			settings.analyzeSettings.defaultOutput,
		)
		.option("-v, --verbose", "verbose output")
		.option("-w, --write", "write analyzed files to output directory")
		.action(
			async ({
				duplicates,
				input,
				output,
				verbose,
				write,
			}: {
				duplicates: boolean;
				input: string;
				output: string;
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
						? `Analyzing files | Duplicates: ${duplicates} | Input: ${input} | Output: ${output} | Verbose: ${verbose} | Write: ${write}`
						: undefined,
				);

				// Setup data to collect
				const foundCollections: string[] = [];
				const foundPresets: string[] = [];
				const foundTextures: string[] = [];
				const foundCoverImages: string[] = [];
				const foundBroken: string[] = [];
				const foundReviews = [];
				let completeResults = [];

				// Get contents of the input directory
				const contents = readdirSync(input, {
					withFileTypes: true,
					recursive: true,
				});

				// Flip the contents array to have the deepest files first
				contents.reverse();

				// For each collection, extract
				for (const file of contents) {
					// Create the input file path
					const inputFile = join(input, file.name);

					// Skip files and directories
					if (file.isDirectory() || inputFile.includes("broken-files")) {
						continue;
					}

					// Test if broken
					if (isFileBroken(inputFile)) {
						foundBroken.push(file.name);
					}

					// Get data from file
					const { data, error } = await useFileAnalyzer(
						input,
						inputFile,
						duplicates,
					);

					if (!data && error) {
						consoleError(error);

						continue;
					}

					if (!data) {
						continue;
					}

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
					} = data;

					// Add collection to foundCollections, if it doesn't exist
					for (const collection of collections) {
						if (!foundCollections.includes(collection)) {
							foundCollections.push(collection);
						}
					}

					// Add preset to foundPresets
					if (type === "preset") {
						foundPresets.push(fileName);
					}

					// Add texture to foundTextures
					if (type === "texture") {
						foundTextures.push(fileName);
					}

					// Add cover image to foundCoverImages
					if (type === "cover") {
						foundCoverImages.push(fileName);
					}

					// Find reviews
					if (reviews) {
						foundReviews.push({ fileName, reviews });
					}

					// Create the result object
					const result: AnalyzeResults = {
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
								join(output, collection, `${fileName}.json`),
								result,
							);
						}
					}
				}
				// --------------------------------------------

				// Find duplicates by compare each code with each other
				if (duplicates) {
					completeResults = useDuplicateTester(completeResults);
				}

				// --------------------------------------------
				// Log results
				consoleHeader("Analysis complete:");
				consoleItem(`Found Collections: ${foundCollections.length}`);
				consoleItem(`Found Presets: ${foundPresets.length}`);
				consoleItem(`Found Textures: ${foundTextures.length}`);
				consoleItem(`Found Cover Images: ${foundCoverImages.length}`);

				// If broken files are found, write them to a file
				if (foundBroken.length > 0) {
					consoleItem(`Found Broken: ${foundBroken.length}`);

					if (write) {
						useFileWriter(join(output, "broken-files.json"), foundBroken);
					}
				}

				// If long names are found, write them to a file
				if (foundReviews.length > 0) {
					consoleItem(`Marked For Review: ${foundReviews.length}`);

					if (write) {
						useFileWriter(join(output, "reviews.json"), foundReviews);
					}
				}

				// Write to file, if enabled
				if (write) {
					useFileWriter(join(output, "results.json"), completeResults);
				}
			},
		);

	return command;
}
