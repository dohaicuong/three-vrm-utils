import type { Meta, StoryObj } from '@storybook/react-vite'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import { useVRMModel } from './use-vrm-model'
import { useVRMAnimations } from './use-vrm-animations'
import { useVRMAnimationManager } from './use-vrm-animation-manager'
import vrmUrl from './assets/miku_nt_v1.1.2.vrm?url'
import idleUrl from './assets/idle.vrma?url'
import appearingUrl from './assets/appearing.vrma?url'
import peaceSignUrl from './assets/peace-sign.vrma?url'

const motions = {
  idle: idleUrl,
  appearing: appearingUrl,
  'peace-sign': peaceSignUrl,
} as const

type MotionName = keyof typeof motions

const meta = {
  title: 'Hooks/useVRMAnimationManager',
  component: Scene,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      source: {
        code: `import { useVRMModel } from "three-vrm-utils/use-vrm-model";
import { useVRMAnimations } from "three-vrm-utils/use-vrm-animations";
import { useVRMAnimationManager } from "three-vrm-utils/use-vrm-animation-manager";

const motions = {
  idle: "/assets/idle.vrma",
  appearing: "/assets/appearing.vrma",
  "peace-sign": "/assets/peace-sign.vrma",
};

function VRMModel({ url }: { url: string }) {
  const [, vrm] = useVRMModel(url);
  const { actions, mixer } = useVRMAnimations(vrm, motions);
  const { send } = useVRMAnimationManager(mixer, actions, { idle: "idle" });

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

function ManagedVRM({
  url,
  sendRef,
}: {
  url: string
  sendRef: React.RefObject<((name: MotionName) => number) | null>
}) {
  const [, vrm] = useVRMModel(url)
  const { actions, mixer } = useVRMAnimations(vrm, motions)
  const { send } = useVRMAnimationManager(mixer, actions, { idle: 'idle' })

  sendRef.current = send

  useFrame((_, delta) => {
    vrm.update(delta)
  })

  return <primitive object={vrm.scene} />
}

function Scene({ url }: { url: string }) {
  const sendRef = useRef<((name: MotionName) => number) | null>(null)

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <Canvas camera={{ position: [0, 1.2, 1.5], fov: 45 }} style={{ height: '100%' }}>
        <color attach="background" args={['#1a1a1a']} />
        <ambientLight intensity={1} />
        <directionalLight position={[2, 3, 5]} intensity={1} />
        <directionalLight position={[-2, 2, -3]} intensity={0.5} />
        <Suspense fallback={null}>
          <ManagedVRM url={url} sendRef={sendRef} />
        </Suspense>
        <OrbitControls target={[0, 1, 0]} />
      </Canvas>
      <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', gap: 8 }}>
        <button onClick={() => sendRef.current?.('appearing')}>Appearing</button>
        <button onClick={() => sendRef.current?.('peace-sign')}>Peace Sign</button>
      </div>
    </div>
  )
}
