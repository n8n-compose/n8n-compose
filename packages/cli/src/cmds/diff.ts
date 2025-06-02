import type { Argv } from "yargs";
import { diffLines } from "diff";
import { glob } from "fast-glob";
import fs from "node:fs/promises";
import { ensureWorkflowPattern, compileFile } from "@n8n-compose/core";

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
  console.log(
    `Comparing generated JSON from ${filePath} to existing JSON files in ${outDir}`,
  );
  const pattern = ensureWorkflowPattern(filePath);
  for (const file of await glob(pattern)) {
    const newContent = await compileFile(file, outDir, false);
    const existingPath = `${outDir}/${newContent.name}.json`;
    const existingContent = await fs.readFile(existingPath, "utf-8");
    const json2 = JSON.parse(existingContent);
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
