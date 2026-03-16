---
title: useVRMExpressionManager
description: Manage VRM facial expressions with optional hold and decay timing.
---

Manages VRM facial expressions with optional hold and decay timing.

## Usage

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

    // With timing: hold for 2s then decay over 0.2s
    send({ surprised: { value: 1, hold: 2, decay: 0.2 } })
  }, [send])

  useFrame((_, delta) => {
    vrm.update(delta)
  })

  return <primitive object={vrm.scene} />
}
```

## Returns

| Property | Type                           | Description                 |
| -------- | ------------------------------ | --------------------------- |
| `send`   | `(map: ExpressionMap) => void` | Set one or more expressions |

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
