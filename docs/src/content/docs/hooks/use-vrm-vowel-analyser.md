---
title: useVRMVowelAnalyser
description: Microphone audio analysis for VRM lip-sync.
---

Analyses microphone audio via an `AnalyserNode` and maps volume to VRM vowel expressions (aa, ih, ou, ee, oh) for lip-sync.

## Usage

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

## Parameters

| Parameter     | Type                                | Description                        |
| ------------- | ----------------------------------- | ---------------------------------- |
| `analyserRef` | `RefObject<AnalyserNode \| null>`   | Ref to a Web Audio `AnalyserNode`  |
| `onVowel`     | `(vowels: VowelAmplitudes) => void` | Callback with current vowel values |
| `options`     | `object`                            | Configuration options              |

### Options

| Option      | Type     | Default | Description                              |
| ----------- | -------- | ------- | ---------------------------------------- |
| `threshold` | `number` | `0.1`   | Volume threshold to start cycling vowels |
| `interval`  | `number` | `0.12`  | Seconds between vowel changes            |

### VowelAmplitudes

```ts
{
  aa: number
  ih: number
  ou: number
  ee: number
  oh: number
}
```
