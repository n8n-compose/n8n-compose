import { describe, it, expect, vi } from "vitest";
import { file } from "../src/files";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("file function", () => {
  // Setup test data
  const fixturesDir = path.join(__dirname, "fixtures");
  const jsFilePath = path.join(fixturesDir, "test.js");
  const tsFilePath = path.join(fixturesDir, "test.ts");

  // Silence console output
  vi.spyOn(console, "log").mockImplementation(() => {});

  it("should read JavaScript file and return its content", async () => {
    console.log("Testing JS file at:", jsFilePath);
    const result = await file(jsFilePath);
    expect(result).toBeDefined();
    expect(result.jsCode).toContain("console.log");
    expect(result.jsCode).toContain("test js file");
  });

  it("should bundle TypeScript file and return JavaScript", async () => {
    console.log("Testing TS file at:", tsFilePath);
    const result = await file(tsFilePath);
    expect(result).toBeDefined();
    expect(result.jsCode).toBeDefined();
    // The bundled output should be JavaScript that doesn't contain TypeScript type annotations
    expect(result.jsCode).not.toContain(": string");
  });
});
