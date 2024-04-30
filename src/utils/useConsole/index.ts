import { version } from "../../../package.json";

export const consoleTitle = (text?: string) => {
	let title = `\nAnomieVision | Milkdrop Preset Manager | Version: ${version}`;

	if (text) {
		title = `${title}\n\n${text}`;
	}

	console.info(`${title}\n`);
};

export const consoleHeader = (text: string) => {
	const header = `> ${text}`;

	console.info(header);
};

export const consoleItem = (text: string) => {
	const item = `   - ${text}`;

	console.info(item);
};

export const consoleMessage = (text: string) => {
	const message = `${text}`;

	console.info(message);
};

export const consoleList = (listItems: string[]) => {
	const list = listItems.map((item) => `   - ${item}`).join("\n");

	console.info(list);
};

export const consoleError = (text: string) => {
	const error = `Error: ${text}`;

	console.error(error);
};

export const consoleWarning = (text: string) => {
	const warning = `Warning: ${text}`;

	console.warn(warning);
};
