import ora, { type Ora } from "ora";
import { t } from "tasai";

export function useSpinner(message: string): Ora {
	const _message = message ? message : "Loading...";
	const pink = t.fromHex("#D95F80").toFunction();

	const spinner = ora({
		text: pink(_message),
		prefixText: undefined,
		suffixText: undefined,
		spinner: "dots",
		color: "cyan",
		hideCursor: true,
		indent: 0,
	});

	return spinner;
}
