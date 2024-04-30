import { Command } from "commander";
import { settings } from "../../settings";
import {
	consoleError,
	consoleHeader,
	consoleItem,
	consoleTitle,
	consoleWarning,
} from "../../utils/useConsole";
import { useRepositoryDownloader } from "../../utils/useDownload";
import { createDirectory } from "../../utils/useFilesystem";
import { addSubList } from "./list";

export function addDownload(): Command {
	const command = new Command()
		.command("download")
		.description("download preset collections")
		.option(
			"-c, --collections <name...>",
			"collection or collections to download (use 'all' to download all)",
			settings.downloadSettings.defaultCollections,
		)
		.option("-f, --force", "force download")
		.option(
			"-o, --output <directory>",
			"output directory for downloads",
			settings.downloadSettings.defaultOutput,
		)
		.option("-v, --verbose", "verbose output")
		.action(
			({
				collections,
				force,
				output,
				verbose,
			}: {
				collections: string[];
				force: boolean;
				output: string;
				verbose: boolean;
				// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
			}) => {
				// Check if output exists, if not create it
				createDirectory(output);

				consoleTitle(
					verbose
						? `Downloading collections: ${collections} | Force: ${force} | Output: ${output}`
						: undefined,
				);

				// Get collections from settings
				const availCollections = settings.downloadSettings.collections;

				// Check if collections are available
				let selectedCollections:
					| typeof settings.downloadSettings.collections
					| undefined;

				// Check if all collections are selected
				if (collections.includes("all")) {
					selectedCollections = availCollections;
				} else {
					// Check if collections are available
					const availCollectionNames = new Set(
						availCollections.map((collection) => collection.name),
					);
					// Check if collections are missing
					const missingCollections = collections.filter(
						(collection) => !availCollectionNames.has(collection),
					);

					// Log missing collections
					if (missingCollections.length > 0) {
						consoleWarning(
							`Collections: '${missingCollections.join(", ")}' not found`,
						);
						return;
					}

					// Filter collections
					selectedCollections = availCollections.filter((collection) =>
						collections.includes(collection.name),
					);
				}

				// For each collection, download
				for (const collection of selectedCollections) {
					consoleHeader(`Downloading ${collection.name} to ${output}:`);
					consoleItem(`repository: ${collection.repository}`);
					consoleItem(`branch: ${collection.branch}`);

					// Download collection
					const { data, error } = useRepositoryDownloader(
						collection.repository,
						collection.branch,
						output,
						force,
					);

					// Handle errors
					if (!data && error) {
						consoleError(error);
					}
					// Handle warnings
					else if (data && error && !force) {
						consoleItem(error);
					}
					// Handle success
					else if (data) {
						consoleItem(`downloaded to: ${data}`);
					}
				}
			},
		);

	command.addCommand(addSubList());

	return command;
}
