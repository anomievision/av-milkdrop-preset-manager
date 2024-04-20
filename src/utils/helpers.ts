import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { normalizeText } from "normalize-text";

export function checkIfDirOrFile(path: string): "file" | "dir" {
	// Check if input is a file or directory
	const stats = statSync(path, { throwIfNoEntry: false });

	if (stats?.isFile()) {
		return "file";
	}

	if (stats?.isDirectory()) {
		return "dir";
	}

	throw new Error("Invalid path");
}

export function getPresets(path: string) {
	const type = checkIfDirOrFile(path);

	switch (type) {
		case "file": {
			return [path];
		}
		case "dir": {
            let files: string[] = [];
            const dir = readdirSync(path);

            for (const file of dir) {
                const filePath = join(path, file);
                if (file.endsWith(".milk")) {
                    files.push(filePath);
                } else {
                    const nestedFiles = getPresets(filePath);
                    files = files.concat(nestedFiles);
                }
            }

            return files;
        }
		default: {
			throw new Error("Invalid path");
		}
	}
}

export function getDataFromPresetPath(path: string): {
	name: string,
	collection: string,
	tags: string[],
} {
	// Remove the .milk extension
	path = path.replace(".milk", "");

	// Split the file path into an array of directories and the file name
	let parts: string[];

	if (path.includes("/")) {
		parts = path.split("/");
	} else {
		parts = path.split("\\");
	}

	if (!parts) {
		throw new Error("Invalid file path");
	}

	// Remove the first part (the directory path)
	parts.shift();

	// // Get every part except the last one and set as collection
	// const collection = parts.slice(0, -1).join(" ");

	// // Get every part except the first one and last one and set as tags
	// const tagString = parts.slice(1, -1).join(" ");

	// // Convert tags to an array
	// const tags = tagString.split(" ");

	// // Get the last part and set as name
	// const name = parts[parts.length - 1];

	// Get the last part and set as name
	const name = parts.pop()!;

	// Set the collection as the directory name
	const collection = parts.shift()!;
 
	// Set the remaining parts as tags
	const tags = parts;

	console.log("Name: ", name);
	console.log("Collection: ", collection);
	console.log("Tags: ", tags);

	return {
		name,
		collection,
		tags,
	};
}

export function useNameAnalyzer(name: string): {
    title: string;
	authors: string[];
    fileName: string;
} {
	// Remove '.milk' extension
    name = name.replace(".milk", "");

    let title: string;
    let authors: string[] = [];
    let fileName: string;

    // Remove '.milk' extension
    title = name.replace(".milk", "");

    // Separate authors from title
    const separatorIndex = title.indexOf(" - ");
    if (separatorIndex !== -1) {
        // console.log("Separator: ' - '");

        const authorsPart = title.substring(0, separatorIndex);
        title = title.substring(separatorIndex + 3); // +3 to skip the " - "
        authors = authorsPart.split(/[+&,]/).map(author => author.trim());
    } else {
        title = name;
    }

    // Remove all special characters from the title
    title = normalizeText(title);

    // Replace all spaces and underscores with hyphens, replace all triple hyphens with single hyphens
    title = title.replace(/[\s_]+/g, "-").replace(/---/g, "-");

    // Combine the authors and title to create the file name
    fileName = (authors.join("+") + "_" + title).toLowerCase();

    return {
        title,
        authors,
        fileName,
    };
}

export function useCodeFromFile(filePath: string): string {
	// Read the file
	const file = readFileSync(filePath, "utf-8");

	// Remove everything before [preset00]  (except [preset00])
	const code = file.substring(file.indexOf("[preset00]"));

	return code;
}

// export function useTagsGenerator(_code: string): string[] {
// 	const tags: string[] = [];

// 	// Analayser code

// 	return tags;
// }
