# three-vrm-utils

React hooks and utilities for working with [VRM](https://vrm.dev/) avatars in [React Three Fiber](https://github.com/pmndrs/react-three-fiber). Extension support for [@pixiv/three-vrm](https://github.com/pixiv/three-vrm) and [@pixiv/three-vrm-animation](https://github.com/pixiv/three-vrm/tree/dev/packages/three-vrm-animation).

[Storybook](https://dohaicuong.github.io/three-vrm-utils/)

## Install

```bash
npm install three-vrm-utils
```

### Peer dependencies

```bash
npm install react react-dom three @react-three/fiber @pixiv/three-vrm @pixiv/three-vrm-animation
```

## Usage

### useVRMModel

Loads a VRM model with optimized defaults. Automatically uses `MToonNodeMaterial` when a WebGPU renderer is detected.

```tsx
import { useVRMModel } from 'three-vrm-utils/use-vrm-model'

function VRMModel({ url }: { url: string }) {
  const [gltf, vrm] = useVRMModel(url)
  return <primitive object={vrm.scene} />
}
```

### useVRMAnimations

Loads and manages VRM animations from `.vrma` files. Returns typed actions and a mixer for frame updates.

```tsx
import { useVRMModel } from 'three-vrm-utils/use-vrm-model'
import { useVRMAnimations } from 'three-vrm-utils/use-vrm-animations'
import { useFrame } from '@react-three/fiber'
import { useEffect } from 'react'

const motions = {
  idle: '/assets/idle.vrma',
  wave: '/assets/wave.vrma',
}

function AnimatedVRM({ url }: { url: string }) {
  const [, vrm] = useVRMModel(url)
  const { actions } = useVRMAnimations(vrm, motions)

  useEffect(() => {
    actions.idle?.reset().fadeIn(0.3).play()
    return () => {
      actions.idle?.fadeOut(0.3)
    }
  }, [actions])

  useFrame((_, delta) => {
    vrm.update(delta)
  })

  return <primitive object={vrm.scene} />
}
```

### useVRMBlink

Adds automatic blinking to a VRM model with configurable timing and double-blink support.

```tsx
import { useVRMModel } from 'three-vrm-utils/use-vrm-model'
import { useVRMBlink } from 'three-vrm-utils/use-vrm-blink'
import { useFrame } from '@react-three/fiber'

function BlinkingVRM({ url }: { url: string }) {
  const [, vrm] = useVRMModel(url)
  useVRMBlink(vrm, {
    minInterval: 2.5,
    maxInterval: 5.5,
    doubleBlinkChance: 0.12,
  })

  useFrame((_, delta) => {
    vrm.update(delta)
  })

  return <primitive object={vrm.scene} />
}
```

### useVRMBreathing

Adds a subtle breathing animation to a VRM model by scaling the chest and spine bones.

```tsx
import { useVRMModel } from 'three-vrm-utils/use-vrm-model'
import { useVRMBreathing } from 'three-vrm-utils/use-vrm-breathing'
import { useFrame } from '@react-three/fiber'

function BreathingVRM({ url }: { url: string }) {
  const [, vrm] = useVRMModel(url)
  useVRMBreathing(vrm, {
    bpm: 18,
    intensity: 0.01,
  })

  useFrame((_, delta) => {
    vrm.update(delta)
  })

  return <primitive object={vrm.scene} />
}
```

### useVRMAnimationManager

A state-machine wrapper for VRM animations. Manages idle loops, crossfading, and automatic return-to-idle when an action finishes.

```tsx
import { useVRMModel } from 'three-vrm-utils/use-vrm-model'
import { useVRMAnimations } from 'three-vrm-utils/use-vrm-animations'
import { useVRMAnimationManager } from 'three-vrm-utils/use-vrm-animation-manager'
import { useFrame } from '@react-three/fiber'

const motions = {
  idle: '/assets/idle.vrma',
  wave: '/assets/wave.vrma',
}

function ManagedVRM({ url }: { url: string }) {
  const [, vrm] = useVRMModel(url)
  const { actions, mixer } = useVRMAnimations(vrm, motions)
  const { send } = useVRMAnimationManager(mixer, actions, {
    idle: 'idle',
    fadeTime: 0.3,
  })

  useFrame((_, delta) => {
    vrm.update(delta)
  })

  return <primitive object={vrm.scene} onClick={() => send('wave')} />
}
```

### useVRMExpressionManager

Manages VRM facial expressions with optional hold and decay timing.

```tsx
import { useVRMModel } from 'three-vrm-utils/use-vrm-model'
import { useVRMExpressionManager } from 'three-vrm-utils/use-vrm-expression-manager'
import { useFrame } from '@react-three/fiber'
import { useEffect } from 'react'

function ExpressiveVRM({ url }: { url: string }) {
  const [, vrm] = useVRMModel(url)
  const { send } = useVRMExpressionManager(vrm)

  useEffect(() => {
    // Simple: set expression to a value
    send({ happy: 1 })

    // With timing: hold for 1s then decay over 0.5s
    send({ surprised: { value: 1, hold: 1, decay: 0.5 } })
  }, [send])

  useFrame((_, delta) => {
    vrm.update(delta)
  })

  return <primitive object={vrm.scene} />
}
```

### useVRMVowelAnalyser

Analyses microphone audio via an `AnalyserNode` and maps volume to VRM vowel expressions (aa, ih, ou, ee, oh) for lip-sync.

```tsx
import { useVRMModel } from 'three-vrm-utils/use-vrm-model'
import { useVRMVowelAnalyser } from 'three-vrm-utils/use-vrm-vowel-analyser'
import { useFrame } from '@react-three/fiber'

function TalkingVRM({
  url,
  analyserRef,
}: {
  url: string
  analyserRef: React.RefObject<AnalyserNode | null>
}) {
  const [, vrm] = useVRMModel(url)

  useVRMVowelAnalyser(analyserRef, (vowels) => {
    const manager = vrm.expressionManager
    if (!manager) return
    manager.setValue('aa', vowels.aa)
    manager.setValue('ih', vowels.ih)
    manager.setValue('ou', vowels.ou)
    manager.setValue('ee', vowels.ee)
    manager.setValue('oh', vowels.oh)
    manager.update()
  })

  useFrame((_, delta) => {
    vrm.update(delta)
  })

  return <primitive object={vrm.scene} />
}
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for local development setup, writing stories, and the release process.

## License

MIT
