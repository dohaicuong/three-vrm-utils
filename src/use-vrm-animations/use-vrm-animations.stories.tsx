import type { Meta, StoryObj } from '@storybook/react-vite'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useEffect } from 'react'
import { useVRMModel } from '../use-vrm-model'
import { useVRMAnimations } from '../use-vrm-animations'
import vrmUrl from '../assets/miku_nt_v1.1.2.vrm?url'
import idleUrl from '../assets/idle.vrma?url'
import appearingUrl from '../assets/appearing.vrma?url'
import peaceSignUrl from '../assets/peace-sign.vrma?url'

const motions = {
  idle: idleUrl,
  appearing: appearingUrl,
  'peace-sign': peaceSignUrl,
} as const

type MotionName = keyof typeof motions

const meta = {
  title: 'Hooks/useVRMAnimations',
  component: Scene,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    animation: {
      control: 'select',
      options: ['idle', 'appearing', 'peace-sign'],
    },
  },
} satisfies Meta<typeof Scene>

export default meta
type Story = StoryObj<typeof meta>

export const Idle: Story = {
  args: {
    url: vrmUrl,
    animation: 'idle',
  },
}

export const Appearing: Story = {
  args: {
    url: vrmUrl,
    animation: 'appearing',
  },
}

export const PeaceSign: Story = {
  args: {
    url: vrmUrl,
    animation: 'peace-sign',
  },
}

function AnimatedVRM({ url, animation }: { url: string; animation: MotionName }) {
  const [, vrm] = useVRMModel(url)
  const { actions } = useVRMAnimations(vrm, motions)

  useEffect(() => {
    const action = actions[animation]
    action?.reset().fadeIn(0.3).play()
    return () => {
      action?.fadeOut(0.3)
    }
  }, [actions, animation])

  useFrame((_, delta) => {
    vrm.update(delta)
  })

  return <primitive object={vrm.scene} />
}

function Scene({ url, animation }: { url: string; animation: MotionName }) {
  return (
    <Canvas camera={{ position: [0, 1.2, 1.5], fov: 45 }} style={{ height: '100vh' }}>
      <color attach="background" args={['#1a1a1a']} />
      <ambientLight intensity={1.6} color="#ffe8d0" />
      <directionalLight position={[0, 0.5, 5]} intensity={0.7} color="#ffdcc0" />
      <directionalLight position={[2, 3, 3]} intensity={0.5} color="#ffe0c8" />
      <directionalLight position={[-2, 2, -3]} intensity={0.25} />
      <Suspense fallback={null}>
        <AnimatedVRM url={url} animation={animation} />
      </Suspense>
      <OrbitControls target={[0, 1, 0]} />
    </Canvas>
  )
}
