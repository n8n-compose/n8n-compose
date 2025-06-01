import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    cli: "src/index.ts",
  },
  format: ["esm"],
  clean: true,
  minify: false,
  splitting: false,
});
