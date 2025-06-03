# Getting Started

## Defining a workflow

To start with defining your workflow, create a file called `n8n-compose.ts`. You can then provide a workflow definition by calling the `defineWorkflow` method, which will create a JSON file compatible with n8n's built-in workflow structure. Making the definition looks like

```ts
import { defineWorkflow } from '@n8n-compose/core';

export default defineWorkflow({...});
```

### Importing an existing workflow

If you have an existing n8n workflow, you can download it through n8n's UI, and then convert it to a definition compatible with n8n-compose by running

```
n8n-compose import MyWorkflow.json
```

## Compiling back to n8n's workflow syntax

Once you have defined your workflow to your satisfaction in `n8n-compose.ts`, you can compile it to a form compatible with n8n's workflow definition with 

```
n8n-compose build n8n-compose.ts
```
