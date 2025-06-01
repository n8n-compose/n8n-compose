# @n8n-compose/cli

CLI for using n8n-compose. The following commands are available:
- `n8n-compose build`
- `n8n-compose diff`
- `n8n-compose import`

## build
Is used for building n8n workflows from n8n-compose compatible definitions.

```
n8n-compose build <entry> [options]
```

### Arguments

`entry`: The entrypoint from which to compile. Can be given as:
- A path to a file
- A path to a folder
- A glob pattern
Each matching file will be executed depending on its type. For java- and typescript files the default export is executed. JSON files are taken as a configuration, inserted into a `defineWorkflow` which is then executed.

Files are output in the `dist` folder (or whatever folder is given in `--out`), with the file name being `[workflow name].json`.

### Options

`--out / -o`: Output directory for the results.
`--watch / -w`: Whether to watch for changes in the source files

## Diff
Will tell you the difference between the **resultant** n8n-format JSON if the workflow file was compiled now and the corresponding already-compiled workflow JSON file.

```
n8n-compose diff <filePath> [options]
```

### Arguments

`filePath`: Path to the file, folder, or a glob pattern for files to run generation on. 

### Options

`--outDir / -o`: Which folder to look for the corresponding JSON files in.

## import
Allows for an n8n-compose formatted configuration to be extracted from a workflow's JSON file as exported from n8n.

```
n8n-compose import <filePath> [options]
```

### Arguments

`filePath`: Path to the file to extract n8n-compose configuration from.

### Options

`--outDir / -o`: The folder to insert the extracted configuration file into