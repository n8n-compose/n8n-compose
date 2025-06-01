# n8n-compose

n8n-compose aims to allow you to properly version and reproducably build your n8n workflows. The project consists of two packages, `@n8n-compose/core` and `@n8n-compose/cli`. See below for a brief documentation of the features of each. Proper documentation to come!

## Example Usage

An example `n8n-compose.config.ts` file:
```ts
import { defineWorkflow } from "@n8n-compose/core";

export default defineWorkflow({
  name: "MyWorkflow",
  active: true,
  nodes: [
    {
      parameters: {
        public: true,
        mode: "webhook",
        options: {
          responseMode: "responseNode",
        },
      },
      position: [250, 300],
      name: "ChatTrigger",
      type: "@n8n/n8n-nodes-langchain.chatTrigger",
      webhookId: "...",
    },
    {
      parameters: {
        agent: "conversationalAgent",
        promptType: "define",
        text: "={{ $json.chatInput }}",
      },
      id: "...",
      name: "AIAgent",
      type: "@n8n/n8n-nodes-langchain.agent",
      position: [500, 300],
    },
    {
      parameters: {
        model: "gpt-4o",
        options: {
          temperature: 0.1,
        },
      },
      position: [400, 500],
      name: "OpenAIChatModel",
      type: "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      credentials: {
        openAiApi: {
          id: "...",
          name: "OpenAi account",
        },
      },
    },
    {
      parameters: {
        respondWith: "allIncomingItems",
        options: {},
      },
      position: [850, 300],
      name: "RespondToWebhook",
      type: "n8n-nodes-base.respondToWebhook",
    },
  ],
  connections: [
    [
      {
        node: "ChatTrigger",
        type: "main",
        index: 0,
      },
      {
        node: "AIAgent",
        type: "main",
        index: 0,
      },
    ],
    [
      {
        node: "OpenAIChatModel",
        type: "ai_languageModel",
        index: 0,
      },
      {
        node: "AIAgent",
        type: "ai_languageModel",
        index: 0,
      },
    ],
    [
      {
        node: "AIAgent",
        type: "main",
        index: 0,
      },
      {
        node: "RespondToWebhook",
        type: "main",
        index: 0,
      },
    ],
  ],
});
```

## CLI

`n8n-compose`'s CLI exposes three commands as of current, `build`, `diff`, and `import`. For full documentation see the `@n8n-compose/cli` specific readme.

### Build
For building an n8n workflow, either based on a typescript file calling `defineWorkflow`, or the plain configuration JSON.

Usage:

```
n8n-compose build <entryPoint> [options]
```

### Diff
For finding out what would change in the generated workflow if you were to run `n8n-compose build` on the file.

Usage:

```
n8n-compose diff <filePath> [options]
```

### Import
For converting a workflow JSON file as exported from n8n into an n8n-compose compatible configuration.

Usage:

```
n8n-compose import <filePath> [options]
```

## Core

Exposes the main functions of the n8n-compose package, such as `defineWorkflow` for building n8n-workflows from a configuration, and the `file` function to include the contents of a java- or typescript file into your workflow. For full documentation see the `@n8n-compose/core` specific readme.

### Define workflows
`defineWorkflow` method, that will return your n8n workflow as JSON. The definition looks like
```ts
export async function defineWorkflow<N extends readonly NodeBase[]>(
  wf: WorkflowJson<N>,
): Promise<IWorkflowBase> {
```

### Include content from other files in your workflow

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
