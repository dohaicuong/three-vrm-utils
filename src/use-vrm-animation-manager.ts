import { useEffect, useRef, useCallback } from 'react'
import { AnimationMixer, AnimationAction, LoopRepeat, LoopOnce } from 'three'

interface UseAnimationFSMOptions<T extends string> {
  /** Idle animation(s). A single name loops forever; an array plays each once and randomly picks the next. */
  idle?: NoInfer<T> | NoInfer<T>[]
  /** State to enter on mount (default: first idle) */
  initial?: NoInfer<T>
  /** Crossfade duration in seconds (default: 0.3) */
  fadeTime?: number
}

interface UseAnimationFSMReturn<T extends string> {
  send: (name: T) => number
  getState: () => T | null
}

export function useVRMAnimationManager<T extends string>(
  mixer: AnimationMixer | null,
  actions: Record<T, AnimationAction> | null,
  {
    idle: idleOpt = 'idle' as T,
    initial: initialOpt,
    fadeTime = 0.3,
  }: UseAnimationFSMOptions<T> = {},
): UseAnimationFSMReturn<T> {
  const idleList = Array.isArray(idleOpt) ? idleOpt : [idleOpt]
  const idleSet = new Set<string>(idleList)
  const singleIdle = idleList.length === 1
  const initial = initialOpt ?? idleList[0]

  const stateRef = useRef<T | null>(null)
  const lastIdleRef = useRef<T | null>(null)

  const pickIdle = useCallback((): T => {
    if (singleIdle) return idleList[0]
    const others = idleList.filter((i) => i !== lastIdleRef.current)
    return others[Math.floor(Math.random() * others.length)]
  }, [idleList, singleIdle])

  const play = useCallback(
    (name: T, loop: boolean): number => {
      if (!actions) return 0

      const next = actions[name]
      if (!next) {
        console.warn(`useAnimationFSM: no action named "${name}"`)
        return 0
      }

      const prev = stateRef.current ? actions[stateRef.current] : null

      next.reset()
      next.setLoop(loop ? LoopRepeat : LoopOnce, loop ? Infinity : 1)
      next.clampWhenFinished = !loop
      next.fadeIn(fadeTime).play()

      if (prev && prev !== next) prev.fadeOut(fadeTime)

      stateRef.current = name
      if (idleSet.has(name)) lastIdleRef.current = name
      return next.getClip().duration
    },
    [actions, fadeTime, idleSet],
  )

  // On mount: enter initial state
  useEffect(() => {
    if (!mixer || !actions) return
    const isIdle = idleSet.has(initial)
    play(initial, isIdle && singleIdle)
  }, [mixer, actions]) // intentionally run once on mount

  // Listen for finished events → return to idle
  useEffect(() => {
    if (!mixer || !actions) return

    const onFinished = (e: { action: AnimationAction }) => {
      const finishedName = (Object.keys(actions) as T[]).find((k) => actions[k] === e.action)
      if (!finishedName) return

      if (idleSet.has(finishedName)) {
        // Idle finished (multi-idle mode) → pick next idle
        const next = pickIdle()
        play(next, singleIdle)
      } else {
        // Action finished → return to idle
        const next = pickIdle()
        play(next, singleIdle)
      }
    }

    mixer.addEventListener('finished', onFinished)
    return () => mixer.removeEventListener('finished', onFinished)
  }, [mixer, actions, idleSet, singleIdle, pickIdle, play])

  const send = useCallback(
    (name: T): number => {
      if (stateRef.current === name) return 0
      const isIdle = idleSet.has(name)
      return play(name, isIdle && singleIdle)
    },
    [idleSet, singleIdle, play],
  )

  return {
    send,
    getState: () => stateRef.current,
  }
}
