import type { VRM } from '@pixiv/three-vrm'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export interface UseVRMBlinkOptions {
  /** Min seconds between blinks (default: 2.0) */
  minInterval?: number
  /** Max seconds between blinks (default: 6.0) */
  maxInterval?: number
  /** How long the eye takes to close in seconds (default: 0.06) */
  closeTime?: number
  /** How long the eye stays closed in seconds (default: 0.05) */
  holdTime?: number
  /** How long the eye takes to open in seconds (default: 0.1) */
  openTime?: number
  /** Chance of a double blink (default: 0.15) */
  doubleBlinkChance?: number
}

type BlinkPhase =
  | 'idle'
  | 'closing'
  | 'holding'
  | 'opening'
  | 'gap'
  | 'closing2'
  | 'holding2'
  | 'opening2'

export function useVRMBlink(
  vrm: VRM,
  {
    minInterval = 2.5,
    maxInterval = 5.5,
    closeTime = 0.1,
    holdTime = 0.08,
    openTime = 0.18,
    doubleBlinkChance = 0.12,
  }: UseVRMBlinkOptions = {},
) {
  const phaseRef = useRef<BlinkPhase>('idle')
  const timerRef = useRef(randomInterval(minInterval, maxInterval))
  const progressRef = useRef(0)
  const isDoubleRef = useRef(false)

  useFrame((_state, delta) => {
    const manager = vrm.expressionManager
    if (!manager) return

    timerRef.current -= delta

    switch (phaseRef.current) {
      case 'idle': {
        if (timerRef.current > 0) break
        isDoubleRef.current = Math.random() < doubleBlinkChance
        phaseRef.current = 'closing'
        progressRef.current = 0
        break
      }

      case 'closing':
      case 'closing2': {
        progressRef.current += delta / closeTime
        const v = Math.min(progressRef.current, 1)
        manager.setValue('blink', v)
        manager.update()
        if (progressRef.current >= 1) {
          phaseRef.current = phaseRef.current === 'closing' ? 'holding' : 'holding2'
          progressRef.current = 0
        }
        break
      }

      case 'holding':
      case 'holding2': {
        progressRef.current += delta
        if (progressRef.current >= holdTime) {
          phaseRef.current = phaseRef.current === 'holding' ? 'opening' : 'opening2'
          progressRef.current = 0
        }
        break
      }

      case 'opening':
      case 'opening2': {
        progressRef.current += delta / openTime
        const v = 1 - Math.min(progressRef.current, 1)
        manager.setValue('blink', v)
        manager.update()
        if (progressRef.current >= 1) {
          manager.setValue('blink', 0)
          manager.update()
          if (phaseRef.current === 'opening' && isDoubleRef.current) {
            phaseRef.current = 'gap'
            progressRef.current = 0
          } else {
            phaseRef.current = 'idle'
            timerRef.current = randomInterval(minInterval, maxInterval)
          }
        }
        break
      }

      case 'gap': {
        // short pause between double blink
        progressRef.current += delta
        if (progressRef.current >= 0.12) {
          phaseRef.current = 'closing2'
          progressRef.current = 0
        }
        break
      }
    }
  })
}

function randomInterval(min: number, max: number) {
  return min + Math.random() * (max - min)
}
