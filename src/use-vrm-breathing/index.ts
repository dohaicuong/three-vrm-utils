import type { VRM } from '@pixiv/three-vrm'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

interface UseVRMBreathingOptions {
  /** Breaths per minute (default: 18) */
  bpm?: number
  /** How much the chest scales on inhale (default: 0.01) */
  intensity?: number
}

export function useVRMBreathing(
  vrm: VRM,
  { bpm = 18, intensity = 0.01 }: UseVRMBreathingOptions = {},
) {
  const timeRef = useRef(0)

  useFrame((_state, delta) => {
    timeRef.current += delta

    const chest = vrm.humanoid.getRawBoneNode('chest')
    const spine = vrm.humanoid.getRawBoneNode('spine')
    if (!chest && !spine) return

    // Slow sine wave at breathing frequency
    const t = (timeRef.current * bpm) / 60
    const breathe = Math.sin(t * Math.PI * 2) * 0.5 + 0.5 // 0 to 1

    const scale = 1 + breathe * intensity

    chest?.scale.set(scale, scale, scale)
    spine?.scale.set(1, 1 + breathe * intensity * 0.5, 1) // subtle Y stretch on spine
  })
}
