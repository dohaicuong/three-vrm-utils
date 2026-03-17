import type { Meta, StoryObj } from '@storybook/react-vite'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { useVRMModel } from '../use-vrm-model'
import vrmUrl from '../assets/miku_nt_v1.1.2.vrm?url'

const meta = {
  title: 'Hooks/useVRMModel',
  component: Scene,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Scene>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    url: vrmUrl,
  },
}

function VRMModel({ url }: { url: string }) {
  const [, vrm] = useVRMModel(url)
  return <primitive object={vrm.scene} />
}

function Scene({ url }: { url: string }) {
  return (
    <Canvas camera={{ position: [0, 1.2, 1.5], fov: 45 }} style={{ height: '100vh' }}>
      <color attach="background" args={['#1a1a1a']} />
      <ambientLight intensity={1.6} color="#ffe8d0" />
      <directionalLight position={[0, 0.5, 5]} intensity={0.7} color="#ffdcc0" />
      <directionalLight position={[2, 3, 3]} intensity={0.5} color="#ffe0c8" />
      <directionalLight position={[-2, 2, -3]} intensity={0.25} />
      <Suspense fallback={null}>
        <VRMModel url={url} />
      </Suspense>
      <OrbitControls target={[0, 1, 0]} />
    </Canvas>
  )
}
