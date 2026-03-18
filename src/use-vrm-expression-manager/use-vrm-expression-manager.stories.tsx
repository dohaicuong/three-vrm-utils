import type { Meta, StoryObj } from '@storybook/react-vite'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useEffect, useState } from 'react'
import { useVRMModel } from '../use-vrm-model'
import { useVRMExpressionManager } from '../use-vrm-expression-manager'
import vrmUrl from '../assets/miku_nt_v1.1.2.vrm?url'

const meta = {
  title: 'Hooks/useVRMExpressionManager',
  component: Scene,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    expression: {
      control: 'select',
      options: ['happy', 'angry', 'sad', 'relaxed', 'surprised'],
    },
  },
} satisfies Meta<typeof Scene>

export default meta
type Story = StoryObj<typeof meta>

export const Happy: Story = {
  args: {
    url: vrmUrl,
    expression: 'happy',
  },
}

export const Sad: Story = {
  args: {
    url: vrmUrl,
    expression: 'sad',
  },
}

export const WithDecay: Story = {
  args: {
    url: vrmUrl,
    expression: 'angry',
  },
  render: () => <DecayScene url={vrmUrl} />,
}

export const Crossfade: Story = {
  args: {
    url: vrmUrl,
    expression: 'happy',
  },
  render: () => <CrossfadeScene url={vrmUrl} />,
}

function ExpressionVRM({ url, expression }: { url: string; expression: string }) {
  const [, vrm] = useVRMModel(url)
  const { send } = useVRMExpressionManager(vrm)

  useEffect(() => {
    send({ [expression]: 1 })
  }, [send, expression])

  useFrame((_, delta) => {
    vrm.update(delta)
  })

  return <primitive object={vrm.scene} />
}

function DecayVRM({ url }: { url: string }) {
  const [, vrm] = useVRMModel(url)
  const { send } = useVRMExpressionManager(vrm)

  useEffect(() => {
    send({
      aa: { value: 1, hold: 2, decay: 0.2 },
      angry: { value: 1, hold: 2, decay: 0.2 },
    })
  }, [send])

  useFrame((_, delta) => {
    vrm.update(delta)
  })

  return <primitive object={vrm.scene} />
}

function Scene({ url, expression }: { url: string; expression: string }) {
  return (
    <Canvas camera={{ position: [0, 1.2, 1.5], fov: 45 }} style={{ height: '100vh' }}>
      <color attach="background" args={['#1a1a1a']} />
      <ambientLight intensity={1.6} color="#ffe8d0" />
      <directionalLight position={[0, 0.5, 5]} intensity={0.7} color="#ffdcc0" />
      <directionalLight position={[2, 3, 3]} intensity={0.5} color="#ffe0c8" />
      <directionalLight position={[-2, 2, -3]} intensity={0.25} />
      <Suspense fallback={null}>
        <ExpressionVRM url={url} expression={expression} />
      </Suspense>
      <OrbitControls target={[0, 1, 0]} />
    </Canvas>
  )
}

function DecayScene({ url }: { url: string }) {
  return (
    <Canvas camera={{ position: [0, 1.2, 1.5], fov: 45 }} style={{ height: '100vh' }}>
      <color attach="background" args={['#1a1a1a']} />
      <ambientLight intensity={1.6} color="#ffe8d0" />
      <directionalLight position={[0, 0.5, 5]} intensity={0.7} color="#ffdcc0" />
      <directionalLight position={[2, 3, 3]} intensity={0.5} color="#ffe0c8" />
      <directionalLight position={[-2, 2, -3]} intensity={0.25} />
      <Suspense fallback={null}>
        <DecayVRM url={url} />
      </Suspense>
      <OrbitControls target={[0, 1, 0]} />
    </Canvas>
  )
}

const EXPRESSIONS = ['happy', 'angry', 'sad', 'relaxed', 'surprised'] as const

function CrossfadeVRM({ url, expression }: { url: string; expression: string | null }) {
  const [, vrm] = useVRMModel(url)
  const { send, stop } = useVRMExpressionManager(vrm, { blendTime: 0.4 })

  useEffect(() => {
    if (expression) {
      send({ [expression]: 1 })
    } else {
      stop()
    }
  }, [send, stop, expression])

  useFrame((_, delta) => {
    vrm.update(delta)
  })

  return <primitive object={vrm.scene} />
}

function CrossfadeScene({ url }: { url: string }) {
  const [expression, setExpression] = useState<string | null>('happy')

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 1,
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        {EXPRESSIONS.map((name) => (
          <button
            key={name}
            onClick={() => setExpression(name)}
            style={{
              padding: '6px 14px',
              background: expression === name ? '#4a9eff' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            {name}
          </button>
        ))}
        <button
          onClick={() => setExpression(null)}
          style={{
            padding: '6px 14px',
            background: expression === null ? '#4a9eff' : '#555',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          stop (neutral)
        </button>
      </div>
      <Canvas camera={{ position: [0, 1.2, 1.5], fov: 45 }} style={{ height: '100%' }}>
        <color attach="background" args={['#1a1a1a']} />
        <ambientLight intensity={1.6} color="#ffe8d0" />
        <directionalLight position={[0, 0.5, 5]} intensity={0.7} color="#ffdcc0" />
        <directionalLight position={[2, 3, 3]} intensity={0.5} color="#ffe0c8" />
        <directionalLight position={[-2, 2, -3]} intensity={0.25} />
        <Suspense fallback={null}>
          <CrossfadeVRM url={url} expression={expression} />
        </Suspense>
        <OrbitControls target={[0, 1, 0]} />
      </Canvas>
    </div>
  )
}
