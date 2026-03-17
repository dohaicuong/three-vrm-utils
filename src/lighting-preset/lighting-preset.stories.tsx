import type { Meta, StoryObj } from '@storybook/react-vite'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { useVRMModel } from '../use-vrm-model'
import { LightingPreset } from './lighting-preset'
import vrmUrl from '../assets/miku_nt_v1.1.2.vrm?url'

const meta = {
  title: 'Components/LightingPreset',
  component: Scene,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    preset: {
      control: 'select',
      options: ['warm', 'neutral', 'cool'],
    },
    intensity: {
      control: { type: 'range', min: 0, max: 2, step: 0.1 },
    },
  },
} satisfies Meta<typeof Scene>

export default meta
type Story = StoryObj<typeof meta>

export const Warm: Story = {
  args: {
    url: vrmUrl,
    preset: 'warm',
    intensity: 1,
  },
}

export const Neutral: Story = {
  args: {
    url: vrmUrl,
    preset: 'neutral',
    intensity: 1,
  },
}

export const Cool: Story = {
  args: {
    url: vrmUrl,
    preset: 'cool',
    intensity: 1,
  },
}

function VRMModel({ url }: { url: string }) {
  const [, vrm] = useVRMModel(url)

  useFrame((_, delta) => {
    vrm.update(delta)
  })

  return <primitive object={vrm.scene} />
}

function Scene({
  url,
  preset,
  intensity,
}: {
  url: string
  preset: 'warm' | 'neutral' | 'cool'
  intensity: number
}) {
  return (
    <Canvas camera={{ position: [0, 1.2, 1.5], fov: 45 }} style={{ height: '100vh' }}>
      <color attach="background" args={['#1a1a1a']} />
      <LightingPreset preset={preset} intensity={intensity} />
      <Suspense fallback={null}>
        <VRMModel url={url} />
      </Suspense>
      <OrbitControls target={[0, 1, 0]} />
    </Canvas>
  )
}
