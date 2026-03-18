import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseWakeWordOptions {
  /** Path(s) to .onnx wake word model files */
  modelPath: string | string[]
  /** Also capture audio from wake word to end of speech (default: false) */
  record?: boolean
  /** Auto-start listening on mount (default: true) */
  autoStart?: boolean
}

export interface UseWakeWordReturn {
  /** Whether the hook is actively listening for the wake word */
  isListening: boolean
  /** Start listening */
  start: () => void
  /** Stop listening (e.g., while VRM is speaking to avoid self-trigger) */
  stop: () => void
}

interface HeyBuddyResult {
  listening: boolean
  recording: boolean
  speech: { probability: number; active: boolean }
  wakeWords: Record<string, { probability: number; active: boolean }>
}

interface HeyBuddyInstance {
  onProcessed: (callback: (result: HeyBuddyResult) => void) => void
  onRecording: (callback: (audio: Float32Array) => void) => void
  destroy?: () => void
}

interface HeyBuddyConstructor {
  new (options: { modelPath: string | string[]; record?: boolean }): HeyBuddyInstance
}

declare const HeyBuddy: HeyBuddyConstructor

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

let runtimeReady: Promise<void> | null = null

function ensureRuntime(): Promise<void> {
  if (runtimeReady) return runtimeReady
  runtimeReady = (async () => {
    if (typeof window === 'undefined') {
      throw new Error('useWakeWord requires a browser environment')
    }
    // Load ONNX Runtime first, then Hey Buddy
    if (!(window as any).ort) {
      await loadScript('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.0/dist/ort.min.js')
    }
    if (!(window as any).HeyBuddy) {
      await loadScript('https://cdn.jsdelivr.net/npm/hey-buddy-onnx@0.1.2/dist/hey-buddy.min.js')
    }
  })()
  return runtimeReady
}

export function useWakeWord(
  options: UseWakeWordOptions,
  onDetected: (label: string) => void,
): UseWakeWordReturn {
  const { modelPath, record = false, autoStart = true } = options
  const [isListening, setIsListening] = useState(false)
  const instanceRef = useRef<HeyBuddyInstance | null>(null)
  const onDetectedRef = useRef(onDetected)
  onDetectedRef.current = onDetected

  const start = useCallback(async () => {
    if (instanceRef.current) return

    await ensureRuntime()

    const instance = new HeyBuddy({ modelPath, record })
    instanceRef.current = instance

    const prevActive = new Set<string>()

    instance.onProcessed((result) => {
      for (const [label, detection] of Object.entries(result.wakeWords)) {
        if (detection.active && !prevActive.has(label)) {
          prevActive.add(label)
          onDetectedRef.current(label)
        } else if (!detection.active) {
          prevActive.delete(label)
        }
      }
    })

    setIsListening(true)
  }, [modelPath, record])

  const stop = useCallback(() => {
    const instance = instanceRef.current
    if (!instance) return
    instance.destroy?.()
    instanceRef.current = null
    setIsListening(false)
  }, [])

  // Auto-start and cleanup
  useEffect(() => {
    if (autoStart) {
      void start()
    }
    return () => {
      const instance = instanceRef.current
      if (instance) {
        instance.destroy?.()
        instanceRef.current = null
      }
    }
  }, [autoStart, start])

  return { isListening, start, stop }
}
