---
title: useVRMBreathing
description: Subtle breathing animation by scaling chest and spine bones.
---

Adds a subtle breathing animation to a VRM model by scaling the chest and spine bones.

## Usage

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

## Options

| Option      | Type     | Default | Description                         |
| ----------- | -------- | ------- | ----------------------------------- |
| `bpm`       | `number` | `18`    | Breaths per minute                  |
| `intensity` | `number` | `0.01`  | How much the chest scales on inhale |
