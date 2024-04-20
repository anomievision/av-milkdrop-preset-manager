import { Command } from "commander";
import { version } from "../package.json";
import { addConvert } from "./commands/convert";

const program = new Command();

program
	.name("av-mpm")
	.description("CLI for managing Milkdrop presets")
	.version(version, "-v, --version", "output the current version");

program.addCommand(addConvert());

program.parse(process.argv);
