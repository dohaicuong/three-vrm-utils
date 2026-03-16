import type { Meta, StoryObj } from '@storybook/react-vite'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import { useVRMModel } from '../use-vrm-model'
import { useWebcamLookAt } from '.'
import { VRMLookAtDebug } from '../vrm-look-at-debug'
import vrmUrl from '../assets/miku_nt_v1.1.2.vrm?url'

const meta = {
  title: 'Hooks/useWebcamLookAt',
  component: Scene,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      source: {
        code: `import { useVRMModel } from "three-vrm-utils/use-vrm-model";
import { useWebcamLookAt } from "three-vrm-utils/use-vrm-webcam-look-at";

function WebcamVRM({ url, videoRef }: { url: string; videoRef: React.RefObject<HTMLVideoElement | null> }) {
  const [, vrm] = useVRMModel(url);
  useWebcamLookAt(vrm, videoRef);

  useFrame((_, delta) => vrm.update(delta));

  return <primitive object={vrm.scene} />;
}`,
      },
    },
  },
  argTypes: {
    smoothing: { control: { type: 'range', min: 0.01, max: 0.3, step: 0.01 } },
    frameSkip: { control: { type: 'range', min: 0, max: 5, step: 1 } },
  },
} satisfies Meta<typeof Scene>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    url: vrmUrl,
    smoothing: 0.05,
    frameSkip: 1,
  },
}

export const WithDebug: Story = {
  args: {
    url: vrmUrl,
    smoothing: 0.05,
    frameSkip: 1,
    debug: true,
  },
  parameters: {
    docs: { description: { story: 'Shows a red debug line from eyes to look-at target' } },
  },
}

interface SceneProps {
  url: string
  smoothing: number
  frameSkip: number
  debug?: boolean
}

function WebcamVRM({
  url,
  videoRef,
  smoothing,
  frameSkip,
  debug,
}: {
  url: string
  videoRef: React.RefObject<HTMLVideoElement | null>
  smoothing: number
  frameSkip: number
  debug?: boolean
}) {
  const [, vrm] = useVRMModel(url)
  const { targetRef } = useWebcamLookAt(vrm, videoRef, { smoothing, frameSkip })

  useFrame((_, delta) => {
    vrm.update(delta)
  })

  return (
    <>
      <primitive object={vrm.scene} />
      {debug && <VRMLookAtDebug vrm={vrm} targetRef={targetRef} />}
    </>
  )
}

function Scene({ url, smoothing, frameSkip, debug }: SceneProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <Canvas camera={{ position: [0, 1.2, 1.5], fov: 45 }} style={{ height: '100%' }}>
        <color attach="background" args={['#1a1a1a']} />
        <ambientLight intensity={1} />
        <directionalLight position={[2, 3, 5]} intensity={1} />
        <directionalLight position={[-2, 2, -3]} intensity={0.5} />
        <Suspense fallback={null}>
          <WebcamVRM
            url={url}
            videoRef={videoRef}
            smoothing={smoothing}
            frameSkip={frameSkip}
            debug={debug}
          />
        </Suspense>
        <OrbitControls target={[0, 1, 0]} />
      </Canvas>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          width: 160,
          borderRadius: 8,
          opacity: 0.8,
        }}
      />
    </div>
  )
}
