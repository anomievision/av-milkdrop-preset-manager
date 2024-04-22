import { readFileSync } from "node:fs";
import { useCodeFromFile } from "../../utils/useFilesystem";

export async function findDuplicatePresets(
	preset: string,
	presets: string[],
): Promise<string[]> {
	const presetCode = await useCodeFromFile(preset);
	const matches = [];

	for (const _preset of presets) {
		if (preset === _preset) {
			continue;
		}

		const file = readFileSync(_preset);
		let text: string;

		if (preset.endsWith(".json")) {
			const json = JSON.parse(file.toString());
			text = json.code;
		} else {
			text = file.toString();
		}

		// Remove everything before [preset00]  (except [preset00])
		text = text.substring(text.indexOf("[preset00]"));

		if (presetCode === text) {
			matches.push(_preset);
		}
	}

	return matches;
}
