# n8n-compose

n8n-compose aims to allow you to properly version and reproducably build your n8n workflows. The project consists of two packages, `@n8n-compose/core` and `@n8n-compose/cli`. See below for a brief documentation of the features of each. Proper documentation to come!

## CLI

Nothing to see here.

## Core

Exposes the `defineWorkflow` method, that will return your n8n workflow as JSON. The definition looks like
```ts
export async function defineWorkflow<N extends readonly NodeBase[]>(
  wf: WorkflowJson<N>,
): Promise<IWorkflowBase> {
```

An example of how to use will follow.

Also exposes `file` function, which allows you to provide either a javascript of a typescript file as `parameters` to a code cell.
```ts
export async function file(
  filePath: string,
  compilerOptions?: esbuild.BuildOptions,
): Promise<{ jsCode: string }>
```

## Installing from source

Ensure you have [Bun](https://bun.sh) installed on your machine, and run 

```bash
bun i
```

in the root folder of the repository
