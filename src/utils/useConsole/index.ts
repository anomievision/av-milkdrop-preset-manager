import ora from "ora";
import type { Ora } from "ora";
import { parseUsing24BitColors } from "tasai";

export function useSpinner(message: string): Ora {
	const _message = message ? message : "Loading...";
	const _styled = parseUsing24BitColors(`<#D95F80>${_message}<r>`);

	const _spinner = ora({
		text: _styled,
		prefixText: undefined,
		suffixText: undefined,
		spinner: "dots",
		color: "cyan",
		hideCursor: true,
		indent: 0,
	});

	return _spinner;
}
