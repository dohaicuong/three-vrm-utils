---
title: VRMModel
description: All-in-one VRM component with animations, blink, breathing, expressions, and lip-sync.
---

A batteries-included component that combines all hooks into a single `<VRMModel />`. Access animations, expressions, and state via ref. The component is generic — motion names are inferred from the `motions` prop for full type safety.

## Usage

```tsx
import { useRef } from 'react'
import { VRMModel, type VRMModelRef } from 'three-vrm-utils/vrm-model'
import { LightingPreset } from 'three-vrm-utils/lighting-preset'

const motions = {
  idle: '/assets/idle.vrma',
  wave: '/assets/wave.vrma',
} as const
type Motion = keyof typeof motions

function App() {
  const ref = useRef<VRMModelRef<Motion>>(null)

  return (
    <Canvas>
      <LightingPreset />
      <Suspense fallback={null}>
        <VRMModel ref={ref} url="/model.vrm" motions={motions} idle="idle" blink breathing />
      </Suspense>
    </Canvas>
  )
}
```

## Props

The component is generic: `VRMModel<T>` where `T` is inferred from the keys of `motions`.

| Prop           | Type                                | Default     | Description                                 |
| -------------- | ----------------------------------- | ----------- | ------------------------------------------- |
| `url`          | `string`                            | —           | URL to the VRM model file                   |
| `motions`      | `Record<T, string>`                 | `{}`        | Map of animation names to `.vrma` file URLs |
| `idle`         | `T \| T[]`                          | `'idle'`    | Idle animation name(s)                      |
| `fadeTime`     | `number`                            | `0.3`       | Crossfade duration in seconds               |
| `blink`        | `boolean \| UseVRMBlinkOptions`     | `undefined` | Enable auto-blink with optional config      |
| `breathing`    | `boolean \| UseVRMBreathingOptions` | `undefined` | Enable breathing with optional config       |
| `analyserRef`  | `RefObject<AnalyserNode \| null>`   | `undefined` | Ref to an AnalyserNode for vowel lip-sync   |
| `onVowel`      | `(vowels: VowelAmplitudes) => void` | `undefined` | Callback with vowel amplitudes each frame   |
| `vowelOptions` | `UseAnalyserVowelOptions`           | `undefined` | Options for vowel analyser                  |
| `ref`          | `Ref<VRMModelRef<T>>`               | `undefined` | Ref to access VRM model methods             |

## Ref

Access via `useRef<VRMModelRef<Motion>>()`:

### `ref.current.vrm`

The loaded `VRM` instance for direct access.

### `ref.current.animationManager`

| Method     | Type                  | Description                                |
| ---------- | --------------------- | ------------------------------------------ |
| `send`     | `(name: T) => number` | Trigger an animation, returns its duration |
| `getState` | `() => T \| null`     | Get the current animation state name       |

### `ref.current.expressionManager`

| Method | Type                           | Description                            |
| ------ | ------------------------------ | -------------------------------------- |
| `send` | `(map: ExpressionMap) => void` | Set facial expressions with hold/decay |

## Examples

### Trigger animation

```tsx
// Type-safe — only accepts 'idle' | 'wave'
ref.current?.animationManager.send('wave')
```

### Get current animation state

```tsx
const state = ref.current?.animationManager.getState()
// state is 'idle' | 'wave' | null
```

### Set expression

```tsx
// Simple
ref.current?.expressionManager.send({ happy: 1 })

// With hold and decay
ref.current?.expressionManager.send({
  surprised: { value: 1, hold: 1, decay: 0.5 },
})
```

### Vowel lip-sync

The `analyserRef` accepts any Web Audio `AnalyserNode` — microphone, `<audio>`/`<video>` elements, Web Audio oscillators, etc. Here's an example using a microphone:

```tsx
import { useRef } from 'react'
import { VRMModel, type VRMModelRef } from 'three-vrm-utils/vrm-model'

function App() {
  const ref = useRef<VRMModelRef>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  const startMic = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const ctx = new AudioContext()
    const source = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)
    analyserRef.current = analyser
  }

  return (
    <Canvas>
      <VRMModel
        ref={ref}
        url="/model.vrm"
        analyserRef={analyserRef}
        onVowel={(vowels) => {
          const mgr = ref.current?.vrm.expressionManager
          if (!mgr) return
          mgr.setValue('aa', vowels.aa)
          mgr.setValue('ih', vowels.ih)
          mgr.setValue('ou', vowels.ou)
          mgr.setValue('ee', vowels.ee)
          mgr.setValue('oh', vowels.oh)
          mgr.update()
        }}
      />
    </Canvas>
  )
}
```
