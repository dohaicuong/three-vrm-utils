import type { Meta, StoryObj } from '@storybook/react-vite'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { useVRMModel } from '../use-vrm-model'
import { useVRMBreathing } from '../use-vrm-breathing'
import vrmUrl from '../assets/miku_nt_v1.1.2.vrm?url'

const meta = {
  title: 'Hooks/useVRMBreathing',
  component: Scene,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    bpm: { control: { type: 'range', min: 4, max: 40, step: 1 } },
    intensity: { control: { type: 'range', min: 0, max: 0.05, step: 0.001 } },
  },
} satisfies Meta<typeof Scene>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    url: vrmUrl,
    bpm: 18,
    intensity: 0.01,
  },
}

export const HeavyBreathing: Story = {
  args: {
    url: vrmUrl,
    bpm: 30,
    intensity: 0.03,
  },
}

interface BreathingProps {
  url: string
  bpm: number
  intensity: number
}

function BreathingVRM({ url, ...options }: BreathingProps) {
  const [, vrm] = useVRMModel(url)
  useVRMBreathing(vrm, options)

  useFrame((_, delta) => {
    vrm.update(delta)
  })

  return <primitive object={vrm.scene} />
}

function Scene({ url, ...options }: BreathingProps) {
  return (
    <Canvas camera={{ position: [0, 1.2, 1.5], fov: 45 }} style={{ height: '100vh' }}>
      <color attach="background" args={['#1a1a1a']} />
      <ambientLight intensity={1.6} color="#ffe8d0" />
      <directionalLight position={[0, 0.5, 5]} intensity={0.7} color="#ffdcc0" />
      <directionalLight position={[2, 3, 3]} intensity={0.5} color="#ffe0c8" />
      <directionalLight position={[-2, 2, -3]} intensity={0.25} />
      <Suspense fallback={null}>
        <BreathingVRM url={url} {...options} />
      </Suspense>
      <OrbitControls target={[0, 1, 0]} />
    </Canvas>
  )
}
