# n8n-compose

n8n-compose aims to allow you to properly version and reproducably build your n8n workflows. The project consists of two packages, `@n8n-compose/core` and `@n8n-compose/cli`. See below for a brief documentation of the features of each. Proper documentation to come!

```
npm install @n8n-compose/cli
```

## Example Usage

An example `n8n-compose.ts` file:
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
