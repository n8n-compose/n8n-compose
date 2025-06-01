import type { Argv } from "yargs";
import fs from "node:fs/promises";
import { parseWorkflowJSON } from "@n8n-compose/core";

export const command = "import <filePath> [options]";
export const describe =
  "Turn an existing workflow file into one that can be used to generate the workflow in n8n-compose";
export function builder(y: Argv) {
  return y
    .positional("filePath", {
      type: "string",
      describe: `Path to the file to reverse engineer.`,
    })
    .option("outDir", {
      alias: "o",
      type: "string",
      default: "workflows",
      describe:
        "The folder into which the reverse-engineered file should be put.",
    });
}
export async function handler(argv: { filePath: string; outDir: string }) {
  const { filePath, outDir } = argv;
  if (!filePath) {
    throw new Error("Input file path is required.");
  }
  const content = await fs.readFile(filePath, "utf-8");
  const n8nWorkflowDef = JSON.parse(content);
  const composeWorkflow = await parseWorkflowJSON(n8nWorkflowDef);
  const outFile = `${outDir}/${composeWorkflow.name}.ts`;
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(
    outFile,
    `import { defineWorkflow } from "@n8n-compose/core";\n\nexport default defineWorkflow(${JSON.stringify(
      composeWorkflow,
      null,
      2,
    )});\n`,
  );
  console.log(
    `Reverse-engineered workflow saved to ${outFile}. You can now use it with n8n-compose.`,
  );
}

export default {
  command,
  describe,
  builder,
  handler,
};
