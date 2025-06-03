# CLI

`n8n-compose`'s CLI exposes three commands as of current, `build`, `diff`, and `import`. For full documentation see the `@n8n-compose/cli` specific readme.

## Build
For building an n8n workflow, either based on a typescript file calling `defineWorkflow`, or the plain configuration JSON.

Usage:

```
n8n-compose build <entryPoint> [options]
```

## Diff
For finding out what would change in the generated workflow if you were to run `n8n-compose build` on the file.

Usage:

```
n8n-compose diff <filePath> [options]
```

## Import
For converting a workflow JSON file as exported from n8n into an n8n-compose compatible configuration.

Usage:

```
n8n-compose import <filePath> [options]
```
