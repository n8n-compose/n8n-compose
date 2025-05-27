import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import * as esbuild from "esbuild";

export async function file(
  filePath: string,
  compilerOptions?: esbuild.BuildOptions,
): Promise<{ jsCode: string }> {
  /**
  Loads a file and returns its content as JavaScript code.
  If the file is a TypeScript file, it will be bundled using esbuild.

  @param filePath - The path to the file to load.
  @param compilerOptions - Optional esbuild build options to customize the bundling process.
  @returns An object containing the JavaScript code as a string.
  @throws Will throw an error if the file cannot be read or bundled.
  */
  console.log(`Loading file: ${filePath}...`);
  const ts = filePath.endsWith(".ts");
  const path = resolve(filePath);
  let code: string;
  if (ts) {
    console.log(`Bundling TypeScript file: ${filePath}...`);
    try {
      const { outputFiles } = await esbuild.build({
        entryPoints: [path],
        bundle: true,
        platform: "node",
        format: "esm",
        sourcemap: false,
        minify: true,
        ...compilerOptions,
        write: false, // Prevent writing to disk
      });
      if (outputFiles === undefined || outputFiles.length === 0) {
        throw new Error(`No output files generated while bundling ${filePath}`);
      } else if (outputFiles.length !== 1) {
        console.warn(`
          Multiple files were generated while bundling ${filePath}, only the first one will be used.
          This may be due to a number of reasons, such as:
          - Incorrect build configuration, like using sourcemaps or file splitting.
          - Asserts being imported in the TypeScript file.
          `);
      }
      code = outputFiles[0].text;
    } catch (error) {
      const e = new Error(`Failed to bundle TypeScript file: ${filePath}`);
      e.cause = error;
      throw e;
    }
  } else {
    code = await readFile(path, "utf-8");
  }
  return { jsCode: code };
}
