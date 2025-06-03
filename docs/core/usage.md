# Usage

In your `n8n-compose.ts` file, import the functions you need from `@n8n-compose/core`. Most likely, at minimum this will include `defineWorkflow`. Then you can call the function with your desired workflow definition. You can also make use of all of typescript's features, such as defining parts of your configuration through variables or functions.

```ts
import { defineWorkflow } from '@n8n-compose/core';

export default defineWorkflow({...});
```

## Include code in your workflow

Also exposes `file` function, which allows you to provide either a javascript of a typescript file as `parameters` to a code cell.

An example usecase is if you have a code node the content of which you want to version control in git. You can store your code in `my-code-node.js`, and then "import" it in your `n8n-compose.ts` file:

```ts
import { ..., file } from '@n8n-compose/core';

export default defineWorkflow({
    ...,
    {
      parameters: {
        file("./my-code-node.js")
      },
      type: "n8n-nodes-base.code",
      position: [-640, 260],
      id: "...",
      name: "Code",
    },
    ...
})
