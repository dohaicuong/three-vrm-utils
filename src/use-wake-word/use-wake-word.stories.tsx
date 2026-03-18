import type { Meta, StoryObj } from '@storybook/react-vite'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useEffect, useRef, useState } from 'react'
import { VRMModel, type VRMModelRef } from '../vrm-model'
import { useWakeWord } from '.'
import { LightingPreset } from '../lighting-preset'
import vrmUrl from '../assets/miku_nt_v1.1.2-fixed-springbone.vrm?url'
import idleUrl from '../assets/idle.vrma?url'
import peaceSignUrl from '../assets/peace-sign.vrma?url'

const motions = {
  idle: idleUrl,
  'peace-sign': peaceSignUrl,
} as const

type Motion = keyof typeof motions

const meta = {
  title: 'Hooks/useWakeWord',
  component: WakeWordScene,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof WakeWordScene>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    url: vrmUrl,
    modelPath: '/models/hey-buddy.onnx',
  },
}

function WakeWordScene({ url, modelPath }: { url: string; modelPath: string }) {
  const [detected, setDetected] = useState(false)
  const vrmRef = useRef<VRMModelRef<Motion>>(null)

  const peace = () => {
    const duration = vrmRef.current?.animationManager.send('peace-sign') ?? 0
    setTimeout(() => {
      vrmRef.current?.expressionManager.send({
        happy: { value: 1, hold: duration - 3.5, decay: 0.15 },
      })
    }, 150)
  }

  const { isListening, start, stop } = useWakeWord({ modelPath }, (_label) => {
    peace()
    setDetected(true)
  })

  useEffect(() => {
    if (detected) {
      const timer = setTimeout(() => setDetected(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [detected])

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div
          style={{
            padding: '8px 14px',
            background: isListening ? '#2a6e2a' : '#555',
            color: '#fff',
            borderRadius: 6,
            fontSize: 14,
          }}
        >
          {isListening ? 'Listening for "hey buddy"...' : 'Paused'}
        </div>
        {detected && (
          <div
            style={{
              padding: '8px 14px',
              background: '#4a9eff',
              color: '#fff',
              borderRadius: 6,
              fontSize: 14,
            }}
          >
            Wake word detected!
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => start()}
            style={{
              padding: '6px 14px',
              background: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            start
          </button>
          <button
            onClick={() => stop()}
            style={{
              padding: '6px 14px',
              background: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            stop
          </button>
          <button
            onClick={peace}
            style={{
              padding: '6px 14px',
              background: '#4a9eff',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            peace sign
          </button>
        </div>
      </div>
      <Canvas camera={{ position: [0, 1.2, 1.5], fov: 45 }} style={{ height: '100%' }}>
        <color attach="background" args={['#1a1a1a']} />
        <LightingPreset />
        <Suspense fallback={null}>
          <VRMModel ref={vrmRef} url={url} motions={motions} idle="idle" blink breathing />
        </Suspense>
        <OrbitControls target={[0, 1, 0]} />
      </Canvas>
    </div>
  )
}
