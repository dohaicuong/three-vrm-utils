import type { Meta, StoryObj } from '@storybook/react-vite'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { useVRMModel } from '../use-vrm-model'
import { useVRMBlink } from '../use-vrm-blink'
import { LightingPreset } from '../lighting-preset'
import vrmUrl from '../assets/miku_nt_v1.1.2.vrm?url'

const meta = {
  title: 'Hooks/useVRMBlink',
  component: Scene,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    minInterval: { control: { type: 'range', min: 0.5, max: 5, step: 0.1 } },
    maxInterval: { control: { type: 'range', min: 2, max: 10, step: 0.1 } },
    closeTime: { control: { type: 'range', min: 0.01, max: 0.3, step: 0.01 } },
    holdTime: { control: { type: 'range', min: 0.01, max: 0.3, step: 0.01 } },
    openTime: { control: { type: 'range', min: 0.01, max: 0.5, step: 0.01 } },
    doubleBlinkChance: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
  },
} satisfies Meta<typeof Scene>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    url: vrmUrl,
    minInterval: 2.5,
    maxInterval: 5.5,
    closeTime: 0.1,
    holdTime: 0.08,
    openTime: 0.18,
    doubleBlinkChance: 0.12,
  },
}

export const FrequentBlink: Story = {
  args: {
    url: vrmUrl,
    minInterval: 0.8,
    maxInterval: 1.5,
    closeTime: 0.06,
    holdTime: 0.05,
    openTime: 0.1,
    doubleBlinkChance: 0.5,
  },
}

interface BlinkProps {
  url: string
  minInterval: number
  maxInterval: number
  closeTime: number
  holdTime: number
  openTime: number
  doubleBlinkChance: number
}

function BlinkingVRM({ url, ...options }: BlinkProps) {
  const [, vrm] = useVRMModel(url)
  useVRMBlink(vrm, options)

  useFrame((_, delta) => {
    vrm.update(delta)
  })

  return <primitive object={vrm.scene} />
}

function Scene({ url, ...options }: BlinkProps) {
  return (
    <Canvas camera={{ position: [0, 1.45, 0.6], fov: 30 }} style={{ height: '100vh' }}>
      <color attach="background" args={['#1a1a1a']} />
      <LightingPreset />
      <Suspense fallback={null}>
        <BlinkingVRM url={url} {...options} />
      </Suspense>
      <OrbitControls target={[0, 1.4, 0]} />
    </Canvas>
  )
}
