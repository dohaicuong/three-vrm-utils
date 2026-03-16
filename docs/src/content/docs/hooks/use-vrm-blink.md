---
title: useVRMBlink
description: Automatic blinking with configurable timing and double-blink support.
---

Adds automatic blinking to a VRM model with configurable timing and double-blink support.

## Usage

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

## Options

| Option              | Type     | Default | Description                               |
| ------------------- | -------- | ------- | ----------------------------------------- |
| `minInterval`       | `number` | `2.5`   | Minimum seconds between blinks            |
| `maxInterval`       | `number` | `5.5`   | Maximum seconds between blinks            |
| `closeTime`         | `number` | `0.1`   | How long the eye takes to close (seconds) |
| `holdTime`          | `number` | `0.08`  | How long the eye stays closed (seconds)   |
| `openTime`          | `number` | `0.18`  | How long the eye takes to open (seconds)  |
| `doubleBlinkChance` | `number` | `0.12`  | Chance of a double blink (0-1)            |
