import type { VRM, VRMExpressionPresetName } from '@pixiv/three-vrm'
import { useCallback, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

type ExpressionName = VRMExpressionPresetName

interface ExpressionOptions {
  value: number
  /** How long to hold at full value in seconds (default: indefinite) */
  hold?: number
  /** How long to decay to 0 after hold in seconds (default: 0) */
  decay?: number
}

export type ExpressionMap = Partial<Record<ExpressionName, number | ExpressionOptions>>

interface ExpressionState {
  value: number
  current: number
  hold: number // remaining hold time
  decay: number // total decay duration
  decayLeft: number // remaining decay time
}

export function useVRMExpressionManager(vrm: VRM) {
  const stateRef = useRef<Record<string, ExpressionState>>({})

  const send = useCallback(
    (map: ExpressionMap) => {
      const manager = vrm.expressionManager
      if (!manager) return

      // Zero out all tracked expressions
      for (const name of Object.keys(stateRef.current)) {
        manager.setValue(name, 0)
      }
      stateRef.current = {}

      for (const [name, opts] of Object.entries(map)) {
        const { value, hold, decay } =
          typeof opts === 'number'
            ? { value: opts, hold: undefined, decay: undefined }
            : (opts as ExpressionOptions)

        manager.setValue(name, value)
        stateRef.current[name] = {
          value,
          current: value,
          hold: hold ?? -1, // -1 = hold indefinitely
          decay: decay ?? 0,
          decayLeft: decay ?? 0,
        }
      }

      manager.update()
    },
    [vrm],
  )

  useFrame((_state, delta) => {
    const manager = vrm.expressionManager
    if (!manager) return

    let dirty = false

    for (const [name, s] of Object.entries(stateRef.current)) {
      if (s.hold > 0) {
        s.hold -= delta
        continue
      }

      // hold indefinitely — skip decay
      if (s.hold === -1) continue

      // hold just expired — start decay
      if (s.decayLeft > 0) {
        s.decayLeft -= delta
        const t = Math.max(0, s.decayLeft / s.decay)
        s.current = s.value * t
        manager.setValue(name, s.current)
        dirty = true

        if (s.decayLeft <= 0) {
          manager.setValue(name, 0)
          delete stateRef.current[name]
        }
      }
    }

    if (dirty) manager.update()
  })

  return { send }
}
