import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  pack: {
    entry: ["src/use-vrm-model.ts"],
    dts: {
      tsgo: true,
    },
    exports: true,
  },
  lint: {
    ignorePatterns: ["package.json", " .github/renovate.json"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
