import type { Argv } from "yargs";
import { diffLines } from "diff";
import fs from "node:fs/promises";
import { ensureWorkflowPattern, compileFile } from "@n8n-compose/core";
import { makePathAbsolute } from "../helpers";

export const command = "diff <filePath> [options]";
export const describe =
  "Compare the JSON that would be generated from a workflow file to an existing JSON file";
export function builder(y: Argv) {
  return y
    .positional("filePath", {
      type: "string",
      describe: `Path to the file, folder, or glob pattern to run generation on.`,
    })
    .option("outDir", {
      alias: "o",
      type: "string",
      default: "dist",
      describe: "Path to look for the existing JSON file to compare against.",
    });
}
export async function handler(argv: { filePath: string; outDir: string }) {
  const { filePath, outDir } = argv;
  if (!filePath) {
    throw new Error("Input file path is required.");
  }
  const absPath = makePathAbsolute(filePath);
  console.log(
    `Comparing generated JSON from ${absPath} to existing JSON files in ${outDir}`,
  );
  const pattern = ensureWorkflowPattern(absPath);
  for await (const file of fs.glob(pattern, {})) {
    const newContent = await compileFile(file, outDir, false);
    const existingPath = `${outDir}/${newContent.name}.json`;
    const json2 = JSON.parse(existingPath);
    printJsonDiff(newContent, json2);
  }
}

function stable(obj: object): string {
  return JSON.stringify(obj, Object.keys(obj).sort(), 2);
}

export function printJsonDiff(a: object, b: object): void {
  const lhs = stable(a) + "\n";
  const rhs = stable(b) + "\n";

  diffLines(lhs, rhs).forEach((part) => {
    const { added, removed, value } = part;
    const colour = added
      ? "\x1b[32m" // green
      : removed
      ? "\x1b[31m" // red
      : "\x1b[37m"; // grey
    process.stdout.write(colour + value + "\x1b[0m");
  });
}

export default {
  command,
  describe,
  builder,
  handler,
};
