import { Command } from "commander";
import { settings } from "../../settings";
import {
	consoleError,
	consoleHeader,
	consoleItem,
	consoleTitle,
} from "../../utils/useConsole";

export function addSubList(): Command {
	const command = new Command()
		.command("list")
		.description("list available collections")
		.option("-s, --simplify", "simplify output")
		.action(({ simplify }: { simplify: boolean }) => {
			// Get collections from settings
			const collections = settings.downloadSettings.collections;

			// Put collections in alphabetical order
			collections.sort((a, b) => a.name.localeCompare(b.name));

			// Check if collections are available
			if (collections.length === 0) {
				if (simplify) {
					console.info(0);
				} else {
					consoleError("No collections available");
				}

				return;
			}

			if (!simplify) {
				consoleTitle("Available collections:");
			}

			// List collections
			for (const collection of collections) {
				if (simplify) {
					console.info(collection.name);
				} else {
					consoleHeader(collection.name);
					consoleItem(`repository: ${collection.repository}`);
					consoleItem(`branch: ${collection.branch}`);
				}
			}
		});

	return command;
}
