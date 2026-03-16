import type { Preview } from '@storybook/react-vite'
import { useEffect } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error Vite handles ?url imports at runtime
import vrmUrl from '../src/assets/miku_nt_v1.1.2.vrm?url'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      story: {
        inline: false,
        iframeHeight: 500,
      },
    },
    a11y: {
      test: 'error',
    },
  },
  decorators: [
    (Story, context) => {
      useEffect(() => {
        return () => {
          useLoader.clear(GLTFLoader, vrmUrl)
        }
      }, [context.id])
      return <Story />
    },
  ],
}

export default preview
