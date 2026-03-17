import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

export default defineConfig({
  site: 'https://dohaicuong.github.io',
  base: '/three-vrm-utils/docs',
  outDir: './dist',
  integrations: [
    starlight({
      title: 'three-vrm-utils',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/dohaicuong/three-vrm-utils',
        },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [{ label: 'Installation', slug: '' }],
        },
        {
          label: 'Hooks',
          items: [
            { label: 'useVRMModel', slug: 'hooks/use-vrm-model' },
            { label: 'useVRMAnimations', slug: 'hooks/use-vrm-animations' },
            { label: 'useVRMAnimationManager', slug: 'hooks/use-vrm-animation-manager' },
            { label: 'useVRMBlink', slug: 'hooks/use-vrm-blink' },
            { label: 'useVRMBreathing', slug: 'hooks/use-vrm-breathing' },
            { label: 'useVRMExpressionManager', slug: 'hooks/use-vrm-expression-manager' },
            { label: 'useVRMVowelAnalyser', slug: 'hooks/use-vrm-vowel-analyser' },
          ],
        },
        {
          label: 'Components',
          items: [{ label: 'LightingPreset', slug: 'components/lighting-preset' }],
        },
        {
          label: 'Links',
          items: [
            {
              label: 'Storybook',
              link: 'https://dohaicuong.github.io/three-vrm-utils/storybook/',
              attrs: { target: '_blank' },
            },
            { label: 'Getting Your VRM Model', slug: 'links/getting-your-vrm-model' },
            { label: 'Getting VRM Animations', slug: 'links/getting-vrm-animations' },
            { label: 'Text to Speech', slug: 'links/text-to-speech' },
          ],
        },
      ],
    }),
  ],
})
