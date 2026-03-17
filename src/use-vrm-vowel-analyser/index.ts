import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { VRMExpressionPresetName } from '@pixiv/three-vrm'

type VowelExpression = Extract<VRMExpressionPresetName, 'aa' | 'ih' | 'ou' | 'ee' | 'oh'>

const VOWELS: VowelExpression[] = ['aa', 'ih', 'ou', 'ee', 'oh']

interface VowelAmplitudes extends Record<VowelExpression, number> {}

export interface UseAnalyserVowelOptions {
  /** Volume threshold to start cycling vowels (default: 0.1) */
  threshold?: number
  /** Seconds between vowel changes (default: 0.12) */
  interval?: number
}

export type VowelCallback = (vowels: VowelAmplitudes) => void

export function useVRMVowelAnalyser(
  analyserRef: React.RefObject<AnalyserNode | null>,
  onVowel: VowelCallback,
  { threshold = 0.1, interval = 0.12 }: UseAnalyserVowelOptions = {},
) {
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const timerRef = useRef(0)
  const currentVowelRef = useRef(0)

  useFrame((_state, delta) => {
    const analyser = analyserRef.current
    if (!analyser) return

    if (!dataRef.current || dataRef.current.length !== analyser.frequencyBinCount) {
      dataRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>
    }

    analyser.getByteFrequencyData(dataRef.current as Uint8Array<ArrayBuffer>)

    const data = dataRef.current
    const binCount = data.length
    const startBin = Math.floor(binCount * 0.05)
    const endBin = Math.floor(binCount * 0.4)

    let sum = 0
    for (let i = startBin; i < endBin; i++) sum += data[i]
    const volume = Math.min(sum / (endBin - startBin) / 140, 1)

    timerRef.current += delta
    if (timerRef.current > interval && volume > threshold) {
      timerRef.current = 0
      currentVowelRef.current = (currentVowelRef.current + 1) % VOWELS.length
    }

    const result = { aa: 0, ih: 0, ou: 0, ee: 0, oh: 0 } as VowelAmplitudes

    if (volume > 0.05) {
      const cur = currentVowelRef.current
      const next = (cur + 1) % VOWELS.length
      result[VOWELS[cur]] = volume * 0.8
      result[VOWELS[next]] = volume * 0.2
    }

    onVowel(result)
  })
}
