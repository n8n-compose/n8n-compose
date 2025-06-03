# @n8n-compose/core

Main tooling for n8n-compose. The main way to use n8n-compose is to make a file that is ran to generate a workflow JSON. All that has to be done for this to work is 

```ts
import { defineWorkflow } from '@n8n-compose/core';

export default defineWorkflow({...});
```

Then when that file is ran through `n8n-compose build`, an n8n compatible workflow JSON should be output.

## Files

One of the main issues I had with using n8n in a production environment was the fact that the content of code cells was very difficult to version control. This should be addressed by the `file` helper from n8n-compose.

```ts
import { defineWorkflow, file } from '@n8n-compose/core';

export default defineWorkflow({
    ...,
    {
      parameters: {
        file("./actions/run.ts")
      },
      type: "n8n-nodes-base.code",
      position: [-640, 260],
      id: "...",
      name: "Code",
    },
    ...
});
```
