#!/usr/bin/env bun
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export function buildCLI(argv = hideBin(process.argv)) {
  return yargs(argv)
    .scriptName("n8n-compose")
    .usage("$0 <command> [options]")
    .command(require("./cmds/build").default)
    .command(require("./cmds/diff").default)
    .command(require("./cmds/import").default)
    .demandCommand(1, "Specify a command")
    .strict()
    .help()
    .version();
}

if (
  import.meta.main ||
  import.meta.url === new URL("file://" + process.argv[1]).href
) {
  buildCLI().parse();
}
