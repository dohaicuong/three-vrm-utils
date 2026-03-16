---
title: useVRMAnimations
description: Load and manage VRM animations from .vrma files.
---

Loads and manages VRM animations from `.vrma` files. Returns typed actions and a mixer for frame updates.

## Usage

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

## Parameters

| Parameter | Type                     | Description                                 |
| --------- | ------------------------ | ------------------------------------------- |
| `vrm`     | `VRM`                    | The VRM instance from `useVRMModel`         |
| `motions` | `Record<string, string>` | Map of animation names to `.vrma` file URLs |

## Returns

| Property  | Type                         | Description                                  |
| --------- | ---------------------------- | -------------------------------------------- |
| `actions` | `Record<T, AnimationAction>` | Typed animation actions keyed by motion name |
| `mixer`   | `AnimationMixer`             | The underlying Three.js mixer                |

:::caution
Do not call `mixer.update(delta)` in `useFrame`. Only call `vrm.update(delta)`. The mixer is managed internally by `useAnimations` from `@react-three/drei`.
:::
