import { Command } from "commander";
import { version } from "../package.json";
import { addAnalyze } from "./commands/analyze";
import { addDownload } from "./commands/download";
import { addExtract } from "./commands/extract";
import { addNormalize } from "./commands/normalize";

const program = new Command();

program
	.name("av-mpm")
	.description("cli for managing milkdrop presets")
	.version(version, "-v, --version", "output the current version");

program.addCommand(addAnalyze());
program.addCommand(addDownload());
program.addCommand(addExtract());
program.addCommand(addNormalize());

program.parse(process.argv);
