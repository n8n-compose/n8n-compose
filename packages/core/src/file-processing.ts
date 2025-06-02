import { promises as fs } from "node:fs";
import type { IWorkflowBase } from "n8n-workflow";
import { defineWorkflow } from "./index.js";
import { makePathAbsolute } from "./helpers.js";
import { glob } from "fast-glob";

export function ensureWorkflowPattern(inputPath: string) {
  let pattern: string = inputPath;
  const fileName = inputPath.split("/").pop();
  if (
    fileName &&
    fileName.indexOf(".") === 0 && // If inputPath is "."
    fileName.indexOf(".") === -1 && // If fileName is not a file with extension
    fileName.indexOf("*") === -1
  ) {
    // inputPath is most likely a directory. We'll just recursively list all files in it.
    if (!pattern.endsWith("/")) {
      pattern += "/";
    }
    pattern += "**";
  }
  return pattern;
}

export async function buildWorkflows(
  inputPath: string,
  outDir: string,
  watch: boolean,
) {
  /*  * This function builds workflows from the specified input path.
   * It supports both single files and directories containing workflow files.
   * If the input path is a directory, it recursively lists all files.
   * The built workflows are saved in the specified output directory.
   * If the watch option is enabled, it will watch for changes in the input files.
   *
   * @param inputPath - Definition of the inputs. Can be a path to a single workflow file,
   *  a directory containing multiple workflow files, or a glob pattern.
   * @param outDir - The directory where the built workflows will be saved.
   * @param watch - Whether to watch for changes in the input files.
   * @returns A promise that resolves when the workflows are built.
   * @throws {Error} If no workflow files are found in the input path.
   * */
  let files: string[] = [];
  const pattern = ensureWorkflowPattern(inputPath);
  for (const file of await glob(pattern)) {
    files.push(file);
  }
  if (files.length === 0) {
    throw new Error(`No workflow files found in: ${inputPath}`);
  }
  console.log(`Found ${files.length} workflow files to build.`);
  return await makeWorkflows({
    files,
    outDir: outDir,
    watch: watch,
  });
}

export async function compileFile(
  file: string,
  outDir?: string,
  write: boolean = true,
): Promise<IWorkflowBase> {
  /* Compiles a single workflow file from the specified path.
   * Supports TypeScript, JavaScript, and JSON files.
   * If the file is TypeScript or JavaScript, it imports the module and executes the default export,
   * which should be a function that returns a workflow definition, i.e. defineWorkflow.
   * If the file is JSON, it reads the content and calls defineWorkflow on it.
   * If the write option is enabled, also saves the compiled workflow to the specified output directory.
   * @param file - The path to the workflow file to compile.
   * @param outDir - The directory where the compiled workflow will be saved.
   * @param write - Whether to write the compiled workflow to the output directory. Defaults to true.
   * @returns A promise that resolves to the compiled workflow.
   * @throws {Error} If the file type is unsupported.
   * */
  console.log(`Compiling workflow file: ${file}`);
  let wf: IWorkflowBase;
  const filePath = makePathAbsolute(file);
  if (!filePath) {
    throw new Error(`File path is not valid: ${file}`);
  }
  console.log(`Compiling workflow file: ${filePath}`);
  if (filePath.endsWith(".ts") || filePath.endsWith(".js")) {
    const mod = await import(filePath);
    wf = await mod.default;
  } else if (filePath.endsWith(".json")) {
    const content = await fs.readFile(filePath, "utf-8");
    const config = JSON.parse(content);
    wf = await defineWorkflow(config);
  } else {
    throw new Error(`Unsupported file type: ${file}`);
  }
  if (write) {
    const out = `${outDir ?? "./dist"}/${wf.name}.json`;
    await fs.writeFile(out, JSON.stringify(wf, null, 2));
  }
  return wf;
}

async function makeWorkflows(props: {
  files: string[];
  outDir: string;
  watch: boolean;
}) {
  await fs.mkdir(props.outDir, { recursive: true });

  await Promise.all(
    props.files.map(async (file) => {
      compileFile(file, props.outDir);
    }),
  );

  if (props.watch) {
    for (const file of props.files) {
      try {
        const watcher = fs.watch(file);
        for await (const event of watcher) {
          if (event.eventType === "change") {
            console.log(`File changed: ${file}`);
            await compileFile(file, props.outDir);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log(`Stopped watching for changes in ${file}`);
          return;
        }
        let errorMessage = "Unknown error";
        if (error instanceof Error) {
          console.error(`Error watching file ${file}: ${error.message}`);
          errorMessage = error.message;
        }
        throw new Error(`Error watching file ${file}: ${errorMessage}`);
      }
    }
  }
}
