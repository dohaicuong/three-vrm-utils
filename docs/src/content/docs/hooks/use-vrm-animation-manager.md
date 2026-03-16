---
title: useVRMAnimationManager
description: State-machine wrapper for VRM animations with idle loops and crossfading.
---

A state-machine wrapper for VRM animations. Manages idle loops, crossfading, and automatic return-to-idle when an action finishes.

## Usage

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

## Parameters

| Parameter | Type                                 | Description                         |
| --------- | ------------------------------------ | ----------------------------------- |
| `mixer`   | `AnimationMixer \| null`             | The mixer from `useVRMAnimations`   |
| `actions` | `Record<T, AnimationAction> \| null` | The actions from `useVRMAnimations` |
| `options` | `object`                             | Configuration options               |

### Options

| Option     | Type       | Default    | Description                                                                                          |
| ---------- | ---------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| `idle`     | `T \| T[]` | `'idle'`   | Idle animation(s). A single name loops forever; an array plays each once and randomly picks the next |
| `initial`  | `T`        | First idle | State to enter on mount                                                                              |
| `fadeTime` | `number`   | `0.3`      | Crossfade duration in seconds                                                                        |

## Returns

| Property   | Type                  | Description                                     |
| ---------- | --------------------- | ----------------------------------------------- |
| `send`     | `(name: T) => number` | Trigger an animation. Returns the clip duration |
| `getState` | `() => T \| null`     | Get the current animation state                 |
