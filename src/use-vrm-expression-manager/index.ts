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

export interface UseVRMExpressionManagerOptions {
  /** Crossfade duration in seconds (default: 0.15) */
  blendTime?: number
}

interface ExpressionState {
  target: number
  current: number
  hold: number // remaining hold time (-1 = indefinite)
  decay: number // total decay duration
  decayLeft: number // remaining decay time
  blending: boolean // currently ramping toward target
}

const DEFAULT_BLEND_TIME = 0.15

export function useVRMExpressionManager(vrm: VRM, options?: UseVRMExpressionManagerOptions) {
  const blendTime = options?.blendTime ?? DEFAULT_BLEND_TIME
  const stateRef = useRef<Record<string, ExpressionState>>({})

  const send = useCallback(
    (map: ExpressionMap) => {
      const manager = vrm.expressionManager
      if (!manager) return

      const newNames = new Set(Object.keys(map))

      // Mark all existing expressions not in the new map for decay-out
      for (const [name, s] of Object.entries(stateRef.current)) {
        if (!newNames.has(name)) {
          s.target = 0
          s.blending = true
          s.hold = 0
          s.decay = 0
          s.decayLeft = 0
        }
      }

      // Set up new expressions
      for (const [name, opts] of Object.entries(map)) {
        const { value, hold, decay } =
          typeof opts === 'number'
            ? { value: opts, hold: undefined, decay: undefined }
            : (opts as ExpressionOptions)

        const existing = stateRef.current[name]

        stateRef.current[name] = {
          target: value,
          current: existing ? existing.current : 0,
          hold: hold ?? -1,
          decay: decay ?? 0,
          decayLeft: decay ?? 0,
          blending: true,
        }
      }
    },
    [vrm],
  )

  const stop = useCallback(() => {
    for (const s of Object.values(stateRef.current)) {
      s.target = 0
      s.blending = true
      s.hold = 0
      s.decay = 0
      s.decayLeft = 0
    }
  }, [])

  useFrame((_state, delta) => {
    const manager = vrm.expressionManager
    if (!manager) return

    let dirty = false
    const bt = blendTime > 0 ? blendTime : 0

    for (const [name, s] of Object.entries(stateRef.current)) {
      // Blend toward target
      if (s.blending) {
        if (bt <= 0) {
          // Instant snap when blendTime is 0
          s.current = s.target
          s.blending = false
        } else {
          const rate = delta / bt
          const diff = s.target - s.current
          if (Math.abs(diff) < 0.001) {
            s.current = s.target
            s.blending = false
          } else {
            s.current += diff * Math.min(rate, 1)
          }
        }
        manager.setValue(name, s.current)
        dirty = true

        // Clean up expressions that have fully blended to 0
        if (!s.blending && s.target === 0) {
          manager.setValue(name, 0)
          delete stateRef.current[name]
          continue
        }

        // If still blending toward target, skip hold/decay logic
        if (s.blending) continue
      }

      // Hold phase
      if (s.hold > 0) {
        s.hold -= delta
        continue
      }

      // Hold indefinitely — skip decay
      if (s.hold === -1) continue

      // Decay phase
      if (s.decayLeft > 0) {
        s.decayLeft -= delta
        const t = Math.max(0, s.decayLeft / s.decay)
        s.current = s.target * t
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

  return { send, stop }
}
