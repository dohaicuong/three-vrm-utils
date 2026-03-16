import type { Meta, StoryObj } from '@storybook/react-vite'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useVRMModel } from './use-vrm-model'
import { useVRMVowelAnalyser } from './use-vrm-vowel-analyser'
import vrmUrl from './assets/miku_nt_v1.1.2.vrm?url'

const meta = {
  title: 'Hooks/useVRMVowelAnalyser',
  component: Scene,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      source: {
        code: `import { useVRMModel } from "three-vrm-utils/use-vrm-model";
import { useVRMVowelAnalyser } from "three-vrm-utils/use-vrm-vowel-analyser";

function TalkingVRM({ url, analyserRef }: { url: string; analyserRef: React.RefObject<AnalyserNode | null> }) {
  const [, vrm] = useVRMModel(url);

  useVRMVowelAnalyser(analyserRef, (vowels) => {
    const manager = vrm.expressionManager;
    if (!manager) return;
    manager.setValue("aa", vowels.aa);
    manager.setValue("ih", vowels.ih);
    manager.setValue("ou", vowels.ou);
    manager.setValue("ee", vowels.ee);
    manager.setValue("oh", vowels.oh);
    manager.update();
  });

  useFrame((_, delta) => vrm.update(delta));

  return <primitive object={vrm.scene} />;
}`,
      },
    },
  },
} satisfies Meta<typeof Scene>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    url: vrmUrl,
  },
}

function TalkingVRM({
  url,
  analyserRef,
}: {
  url: string
  analyserRef: React.RefObject<AnalyserNode | null>
}) {
  const [, vrm] = useVRMModel(url)

  const onVowel = useCallback(
    (vowels: { aa: number; ih: number; ou: number; ee: number; oh: number }) => {
      const manager = vrm.expressionManager
      if (!manager) return
      manager.setValue('aa', vowels.aa)
      manager.setValue('ih', vowels.ih)
      manager.setValue('ou', vowels.ou)
      manager.setValue('ee', vowels.ee)
      manager.setValue('oh', vowels.oh)
      manager.update()
    },
    [vrm],
  )

  useVRMVowelAnalyser(analyserRef, onVowel)

  useFrame((_, delta) => {
    vrm.update(delta)
  })

  return <primitive object={vrm.scene} />
}

function Scene({ url }: { url: string }) {
  const analyserRef = useRef<AnalyserNode | null>(null)
  const [listening, setListening] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      ctxRef.current?.close()
    }
  }, [])

  const toggle = async () => {
    if (listening) {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      ctxRef.current?.close()
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
  }

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <Canvas camera={{ position: [0, 1.45, 0.5], fov: 30 }} style={{ height: '100%' }}>
        <color attach="background" args={['#1a1a1a']} />
        <ambientLight intensity={1} />
        <directionalLight position={[2, 3, 5]} intensity={1} />
        <directionalLight position={[-2, 2, -3]} intensity={0.5} />
        <Suspense fallback={null}>
          <TalkingVRM url={url} analyserRef={analyserRef} />
        </Suspense>
        <OrbitControls target={[0, 1.4, 0]} />
      </Canvas>
      <div style={{ position: 'absolute', bottom: 16, left: 16 }}>
        <button onClick={toggle}>{listening ? 'Stop Mic' : 'Start Mic'}</button>
      </div>
    </div>
  )
}
