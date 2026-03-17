import type { Meta, StoryObj } from '@storybook/react-vite'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useEffect } from 'react'
import { useVRMModel } from '../use-vrm-model'
import { useVRMExpressionManager } from '../use-vrm-expression-manager'
import vrmUrl from '../assets/miku_nt_v1.1.2.vrm?url'

const meta = {
  title: 'Hooks/useVRMExpressionManager',
  component: Scene,
  parameters: {
    layout: 'fullscreen',
    docs: {
      source: {
        code: `import { useVRMModel } from "three-vrm-utils/use-vrm-model";
import { useVRMExpressionManager } from "three-vrm-utils/use-vrm-expression-manager";

function VRMModel({ url }: { url: string }) {
  const [, vrm] = useVRMModel(url);
  const { send } = useVRMExpressionManager(vrm);

  useEffect(() => {
    send({ happy: 1 });
  }, [send]);

  useFrame((_, delta) => vrm.update(delta));

  return <primitive object={vrm.scene} />;
}`,
      },
    },
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
  parameters: {
    docs: { description: { story: 'VRM model with sad expression' } },
  },
}

export const WithDecay: Story = {
  args: {
    url: vrmUrl,
    expression: 'angry',
  },
  render: () => <DecayScene url={vrmUrl} />,
  parameters: {
    docs: {
      description: {
        story: 'Expression with hold and decay — holds for 2s then fades over 0.2s',
      },
    },
  },
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
