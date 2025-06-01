// Miscallaneous helper functions for the CLI
import { resolve, sep, join } from "node:path";
import { homedir } from "node:os";

export function makePathAbsolute(input: string): string {
  if (input.startsWith(`~${sep}`)) {
    input = join(homedir(), input.slice(2));
  }
  return resolve(input);
}
