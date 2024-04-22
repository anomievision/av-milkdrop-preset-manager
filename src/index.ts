import { Command } from "commander";
import { version } from "../package.json";
import { addAnalyze } from "./commands/analyze";
import { addConvert } from "./commands/convert";

const program = new Command();

program
	.name("av-mpm")
	.description("cli for managing Milkdrop presets")
	.version(version, "-v, --version", "output the current version");

program.addCommand(addAnalyze());
program.addCommand(addConvert());

program.parse(process.argv);
