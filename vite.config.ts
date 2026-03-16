import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  pack: {
    dts: {
      tsgo: true,
    },
    exports: true,
  },
  lint: {
    ignorePatterns: ["package.json"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    ignorePatterns: ["package.json"],
  },
});
