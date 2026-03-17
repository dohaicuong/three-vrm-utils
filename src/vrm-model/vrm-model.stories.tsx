import type { Meta, StoryObj } from '@storybook/react-vite'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { VRMModel, type VRMModelRef } from './vrm-model'
import { LightingPreset } from '../lighting-preset'
import vrmUrl from '../assets/miku_nt_v1.1.2-fixed-springbone.vrm?url'
import idleUrl from '../assets/idle.vrma?url'
import appearingUrl from '../assets/appearing.vrma?url'
import peaceSignUrl from '../assets/peace-sign.vrma?url'
import greetingUrl from '../assets/greeting.vrma?url'

const motions = {
  idle: idleUrl,
  appearing: appearingUrl,
  'peace-sign': peaceSignUrl,
  greeting: greetingUrl,
} as const
type Motion = keyof typeof motions

const meta = {
  title: 'Components/VRMModel',
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

function Scene({ url }: { url: string }) {
  const ref = useRef<VRMModelRef<Motion>>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const [listening, setListening] = useState(false)

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      void ctxRef.current?.close()
    }
  }, [])

  const toggleMic = useCallback(async () => {
    if (listening) {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      void ctxRef.current?.close()
      analyserRef.current = null
      setListening(false)
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const ctx = new AudioContext()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      streamRef.current = stream
      ctxRef.current = ctx
      analyserRef.current = analyser
      setListening(true)
    }
  }, [listening])

  const onVowel = useCallback(
    (vowels: { aa: number; ih: number; ou: number; ee: number; oh: number }) => {
      const mgr = ref.current?.vrm.expressionManager
      if (!mgr) return
      mgr.setValue('aa', vowels.aa)
      mgr.setValue('ih', vowels.ih)
      mgr.setValue('ou', vowels.ou)
      mgr.setValue('ee', vowels.ee)
      mgr.setValue('oh', vowels.oh)
      mgr.update()
    },
    [],
  )

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <Canvas camera={{ position: [0, 1.2, 1.5], fov: 45 }} style={{ height: '100%' }}>
        <color attach="background" args={['#1a1a1a']} />
        <LightingPreset />
        <Suspense fallback={null}>
          <VRMModel
            ref={ref}
            url={url}
            motions={motions}
            idle="idle"
            blink
            breathing
            analyserRef={analyserRef}
            onVowel={onVowel}
          />
        </Suspense>
        <OrbitControls target={[0, 1, 0]} />
      </Canvas>
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => ref.current?.animationManager.send('appearing')}>Appearing</button>
          <button onClick={() => ref.current?.animationManager.send('peace-sign')}>
            Peace Sign
          </button>
          <button onClick={() => ref.current?.animationManager.send('greeting')}>Greeting</button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() =>
              ref.current?.expressionManager.send({
                happy: { value: 1, hold: 2, decay: 0.2 },
              })
            }
          >
            Happy
          </button>
          <button
            onClick={() =>
              ref.current?.expressionManager.send({
                angry: { value: 1, hold: 2, decay: 0.2 },
              })
            }
          >
            Angry
          </button>
          <button
            onClick={() =>
              ref.current?.expressionManager.send({
                sad: { value: 1, hold: 2, decay: 0.2 },
              })
            }
          >
            Sad
          </button>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 16, right: 16 }}>
        <button onClick={toggleMic}>{listening ? 'Stop Mic Lipsync' : 'Start Mic Lipsync'}</button>
      </div>
    </div>
  )
}
