import type { Argv } from "yargs";
import { buildWorkflows } from "@n8n-compose/core";
import { makePathAbsolute } from "../helpers";

export const command = "build [entry]";
export const describe = "Compile workflows to JSON";

export function builder(y: Argv) {
  return y
    .positional("entry", {
      type: "string",
      desc: "File or directory path, or glob pattern",
    })
    .option("out", {
      alias: "o",
      type: "string",
      default: "dist",
      desc: "Out dir",
    })
    .option("watch", {
      alias: "w",
      type: "boolean",
      default: false,
      desc: "Watch for changes in the input files",
    });
}

export async function runBuild(opts: {
  inputPath: string;
  outDir: string;
  watch: boolean;
}): Promise<void> {
  /**
   * Builds a workflow from the specified input path.
   * The path can be either a single workflow file, a directory containing multiple workflow files, or a glob pattern.
   * If the input path is a directory, it recursively lists all files.
   * The built workflow is saved in the specified output directory.
   * If the watch option is enabled, it will watch for changes in the input files.
   *
   * @param inputPath - Path to a single workflow file or a directory containing multiple workflow files.
   * @param outDir - The directory where the built workflow will be saved.
   * @param watch - Whether to watch for changes in the input files.
   */
  buildWorkflows(opts.inputPath, opts.outDir, opts.watch);
}

export default {
  command,
  describe,
  builder,
  handler: async (argv) => {
    const { entry, out, watch } = argv;
    if (!entry) {
      throw new Error(
        "No entry point specified. Please provide a file or directory to build.",
      );
    }
    const absPath = makePathAbsolute(entry);
    await runBuild({
      inputPath: absPath,
      outDir: out as string,
      watch: (watch as boolean) ?? false,
    });
  },
};
