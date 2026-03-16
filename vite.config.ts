import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  pack: {
    entry: ["src/use-vrm-model.ts", "src/use-vrm-animations.ts", "src/use-vrm-blink.ts"],
    dts: {
      tsgo: true,
    },
    exports: true,
    deps: {
      neverBundle: [/^@pixiv\//, /^@react-three\//, /^react/, /^three/],
    },
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
