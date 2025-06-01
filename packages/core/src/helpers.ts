// Miscallaneous helper functions for the CLI
import { resolve, sep, join } from "node:path";
import { homedir } from "node:os";

export function makePathAbsolute(input: string): string {
  if (input.startsWith(`~${sep}`)) {
    input = join(homedir(), input.slice(2));
  }
  return resolve(input);
}

export async function promiseQueue<T>(
  promises: Promise<T>[],
  concurrency: number,
): Promise<T[]> {
  const results: T[] = [];
  const executing: Set<() => Promise<void>> = new Set();
  for (const promise of promises) {
    const p = async () => {
      const result = await promise;
      results.push(result);
    };
    const executeAndRemove = async () => {
      await p();
      executing.delete(executeAndRemove);
    };
    executing.add(executeAndRemove);
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  await Promise.all(executing);
  // Since we race promises, ensure all remaining promises are executed
  // before returning the results.
  for (const execute of executing) {
    await execute();
  }

  return results;
}
