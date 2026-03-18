---
title: useVRMExpressionManager
description: Manage VRM facial expressions with crossfade blending, optional hold and decay timing.
---

Manages VRM facial expressions with automatic crossfade blending between states, plus optional hold and decay timing.

## Usage

```tsx
import { useVRMModel } from 'three-vrm-utils/use-vrm-model'
import { useVRMExpressionManager } from 'three-vrm-utils/use-vrm-expression-manager'
import { useFrame } from '@react-three/fiber'
import { useEffect } from 'react'

function ExpressiveVRM({ url }: { url: string }) {
  const [, vrm] = useVRMModel(url)
  const { send, stop } = useVRMExpressionManager(vrm)

  useEffect(() => {
    // Simple: set expression to a value (crossfades in)
    send({ happy: 1 })

    // With timing: hold for 2s then decay over 0.2s
    send({ surprised: { value: 1, hold: 2, decay: 0.2 } })
  }, [send])

  useFrame((_, delta) => {
    vrm.update(delta)
  })

  return <primitive object={vrm.scene} />
}
```

Calling `send()` again crossfades from the current expression to the new one. Previous expressions decay out while new ones ramp in over `blendTime`.

```tsx
send({ happy: 1 }) // happy ramps in over blendTime
send({ relaxed: 0.7 }) // happy decays out, relaxed ramps in (crossfade)
stop() // everything decays to neutral
```

## Options

| Option      | Type     | Default | Description                                                                         |
| ----------- | -------- | ------- | ----------------------------------------------------------------------------------- |
| `blendTime` | `number` | `0.15`  | Crossfade duration between expressions in seconds. Set to `0` for instant snapping. |

```tsx
const { send, stop } = useVRMExpressionManager(vrm, { blendTime: 0.3 })
```

## Returns

| Property | Type                           | Description                                              |
| -------- | ------------------------------ | -------------------------------------------------------- |
| `send`   | `(map: ExpressionMap) => void` | Set one or more expressions (crossfades from previous)   |
| `stop`   | `() => void`                   | Decay all active expressions to neutral over `blendTime` |

## ExpressionMap

Each key is a VRM expression preset name (e.g. `happy`, `angry`, `sad`, `relaxed`, `surprised`, `aa`, `ih`, `ou`, `ee`, `oh`).

Values can be:

- **`number`** — set the expression to that value and hold indefinitely
- **`{ value, hold?, decay? }`** — set with optional timing

| Option  | Type     | Default    | Description                             |
| ------- | -------- | ---------- | --------------------------------------- |
| `value` | `number` | —          | Expression intensity (0-1)              |
| `hold`  | `number` | indefinite | Seconds to hold at full value           |
| `decay` | `number` | `0`        | Seconds to fade to 0 after hold expires |
