import { useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import type { VRM } from '@pixiv/three-vrm'
import { useVRMModel as useVRMModelHook } from '../use-vrm-model'
import { useVRMAnimations } from '../use-vrm-animations'
import { useVRMAnimationManager } from '../use-vrm-animation-manager'
import { useVRMBlink, type UseVRMBlinkOptions } from '../use-vrm-blink'
import { useVRMBreathing, type UseVRMBreathingOptions } from '../use-vrm-breathing'
import { useVRMExpressionManager, type ExpressionMap } from '../use-vrm-expression-manager'
import {
  useVRMVowelAnalyser,
  type VowelCallback,
  type UseAnalyserVowelOptions,
} from '../use-vrm-vowel-analyser'

export interface VRMModelRef<T extends string = string> {
  /** The loaded VRM instance */
  vrm: VRM
  /** Animation state machine — trigger animations and query state */
  animationManager: {
    /** Trigger an animation by name. Returns its duration in seconds */
    send: (name: T) => number
    /** Get the current animation state name */
    getState: () => T | null
  }
  /** Facial expression control with optional hold/decay */
  expressionManager: {
    /** Set expressions. Pass numbers or { value, hold, decay } objects */
    send: (map: ExpressionMap) => void
    /** Decay all active expressions to neutral over blendTime */
    stop: () => void
  }
}

export interface VRMModelProps<T extends string = string> {
  /** URL to the VRM model file */
  url: string
  /** Map of animation names to .vrma file URLs */
  motions?: Record<T, string>
  /** Idle animation name or array of names (default: 'idle') */
  idle?: NoInfer<T> | NoInfer<T>[]
  /** Animation crossfade duration in seconds (default: 0.3) */
  fadeTime?: number
  /** Expression crossfade duration in seconds (default: 0.3) */
  blendTime?: number
  /** Enable auto-blink. Pass true for defaults or an options object */
  blink?: boolean | UseVRMBlinkOptions
  /** Enable breathing. Pass true for defaults or an options object */
  breathing?: boolean | UseVRMBreathingOptions
  /** Ref to an AnalyserNode for vowel lip-sync */
  analyserRef?: React.RefObject<AnalyserNode | null>
  /** Callback with vowel amplitudes each frame */
  onVowel?: VowelCallback
  /** Options for vowel analyser (threshold, interval) */
  vowelOptions?: UseAnalyserVowelOptions
  /** Ref to access VRM model methods */
  ref?: React.Ref<VRMModelRef<T>>
}

const emptyMotions = {} as Record<string, string>
const noopAnalyserRef = { current: null }
const noopVowelCallback: VowelCallback = () => {}

export function VRMModel<T extends string>({
  url,
  motions,
  idle,
  fadeTime,
  blendTime,
  blink,
  breathing,
  analyserRef,
  onVowel,
  vowelOptions,
  ref,
}: VRMModelProps<T>) {
  const [, vrm] = useVRMModelHook(url)

  const { actions, mixer } = useVRMAnimations(vrm, motions ?? emptyMotions)
  const { send, getState } = useVRMAnimationManager(
    motions ? mixer : null,
    motions ? (actions as Record<T, any>) : null,
    { idle, fadeTime },
  )

  useVRMBlink(vrm, typeof blink === 'object' ? blink : undefined)
  useVRMBreathing(vrm, typeof breathing === 'object' ? breathing : undefined)

  const { send: expressSend, stop: expressStop } = useVRMExpressionManager(vrm, { blendTime })

  useVRMVowelAnalyser(analyserRef ?? noopAnalyserRef, onVowel ?? noopVowelCallback, vowelOptions)

  useFrame((_, delta) => {
    vrm.update(delta)
  })

  useImperativeHandle(
    ref,
    () => ({
      vrm,
      animationManager: {
        send,
        getState,
      },
      expressionManager: {
        send: expressSend,
        stop: expressStop,
      },
    }),
    [vrm, send, getState, expressSend, expressStop],
  )

  return <primitive object={vrm.scene} />
}
