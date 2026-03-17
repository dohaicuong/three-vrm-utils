import { defineConfig } from 'vite-plus'

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  pack: {
    entry: [
      'src/use-vrm-model/index.ts',
      'src/use-vrm-animations/index.ts',
      'src/use-vrm-blink/index.ts',
      'src/use-vrm-breathing/index.ts',
      'src/use-vrm-animation-manager/index.ts',
      'src/use-vrm-expression-manager/index.ts',
      'src/use-vrm-vowel-analyser/index.ts',
      'src/lighting-preset/index.ts',
    ],
    dts: {
      tsgo: true,
    },
    exports: true,
    deps: {
      neverBundle: [/^@pixiv\//, /^@react-three\//, /^react/, /^three/],
    },
  },
  lint: {
    ignorePatterns: ['package.json', '.github/renovate.json', 'docs'],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    singleQuote: true,
    semi: false,
  },
})
