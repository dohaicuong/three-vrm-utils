# three-vrm-utils — Update Plan for Agent Integration

## Context

The VRM Assistant Agent streams responses sentence-by-sentence. Each sentence triggers a new `expressionManager.send()` and `animationManager.send()` call. The managers need to **crossfade** between states automatically instead of snapping or requiring manual hold/decay timing.

Currently:

- `expressionManager.send()` — zeros out all previous expressions, sets new ones. No blending.
- `animationManager.send()` — crossfades via `fadeTime`. Already works for the agent use case.

---

## What Needs to Change

### 1. Expression Manager: Auto-crossfade on `send()` (required)

**Current behavior** (`src/use-vrm-expression-manager/index.ts`):

```typescript
send({ happy: 1 }) // sets happy=1 immediately, zeros everything else
send({ relaxed: 0.7 }) // snaps: happy=0, relaxed=0.7 (no transition)
```

**Needed behavior:**

```typescript
send({ happy: 1 }) // happy ramps up to 1 over blendTime
send({ relaxed: 0.7 }) // happy decays out, relaxed ramps in (crossfade)
stop() // everything decays to 0 (neutral)
```

**Changes to `useVRMExpressionManager`:**

- Add `blendTime` option (default: 0.3s) — how fast expressions crossfade
- On `send()`: instead of zeroing previous expressions instantly, mark them for decay over `blendTime`
- New expressions ramp from 0 to target value over `blendTime`
- Add `stop()` method: decays all active expressions to 0 over `blendTime`
- Keep existing `hold` and `decay` support for non-agent use cases (backward compatible)

**New signature:**

```typescript
export function useVRMExpressionManager(vrm: VRM, options?: {
  blendTime?: number  // crossfade duration in seconds (default: 0.3)
}) => {
  send: (map: ExpressionMap) => void
  stop: () => void
}
```

**Implementation approach:**

In `send()`:

1. Mark all currently active expressions as "decaying out" (target = 0, over `blendTime`)
2. For each new expression: if it was already active and decaying, cancel the decay. Set target to new value, ramp over `blendTime`
3. For each new expression that wasn't active: add it with current=0, ramp to target over `blendTime`

In `useFrame()`:

- For each tracked expression, lerp `current` toward `target` by `delta / blendTime`
- When `current` reaches 0, remove from tracking
- Existing hold/decay logic continues to work on top of this (hold delays the start of decay, decay overrides the target to 0 after hold expires)

**State shape changes:**

```typescript
// Current
interface ExpressionState {
  value: number
  current: number
  hold: number
  decay: number
  decayLeft: number
}

// New
interface ExpressionState {
  target: number // what we're blending toward
  current: number // current interpolated value
  hold: number // remaining hold time (-1 = indefinite)
  decay: number // total decay duration (from ExpressionOptions)
  decayLeft: number // remaining decay time
  blending: boolean // true = currently ramping toward target
}
```

### 2. Expression Manager: `stop()` method (required)

```typescript
stop() {
  // Set target=0 for all active expressions
  // They'll crossfade to neutral over blendTime
  for (const state of Object.values(stateRef.current)) {
    state.target = 0
    state.blending = true
    state.hold = 0 // cancel any hold
  }
}
```

### 3. Animation Manager: No changes needed

The current `animationManager.send()` already crossfades via `fadeTime`:

```typescript
next.fadeIn(fadeTime).play()
if (prev && prev !== next) prev.fadeOut(fadeTime)
```

This already handles the agent use case. Each sentence calls `send("nod")`, `send("thinking-pose")`, etc., and the manager crossfades between them. Non-idle animations return to idle when finished.

### 4. VRMModel component: Expose `stop()` via ref (required)

**File:** `src/vrm-model/vrm-model.tsx`

Add `stop()` to the `expressionManager` in `VRMModelRef`:

```typescript
export interface VRMModelRef<T extends string> {
  vrm: VRM
  animationManager: {
    send: (name: T) => number
    getState: () => T | null
  }
  expressionManager: {
    send: (map: ExpressionMap) => void
    stop: () => void // new
  }
}
```

---

## Files to Modify

| File                                                                    | Change                                                   |
| ----------------------------------------------------------------------- | -------------------------------------------------------- |
| `src/use-vrm-expression-manager/index.ts`                               | Add `blendTime` option, crossfade logic, `stop()` method |
| `src/vrm-model/vrm-model.tsx`                                           | Expose `stop()` via ref, pass `blendTime` option         |
| `src/use-vrm-expression-manager/use-vrm-expression-manager.stories.tsx` | Add story demonstrating crossfade between expressions    |

---

## 5. New Hook: `useWakeWord` (new file)

**File:** `src/use-wake-word/index.ts`

A hook that listens for a wake word (e.g., "Hey Miku") using client-side detection. No audio leaves the browser until the wake word is detected.

### Signature

```typescript
export interface UseWakeWordOptions {
  /** Wake word engine (default: "porcupine") */
  engine?: 'porcupine'
  /** Sensitivity 0-1, higher = more sensitive (default: 0.5) */
  sensitivity?: number
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

export function useWakeWord(
  keyword: string,
  onDetected: () => void,
  options?: UseWakeWordOptions,
): UseWakeWordReturn
```

### Usage

```typescript
const wakeWord = useWakeWord('Hey Miku', () => {
  // Wake word detected — show listening expression, start recording
  vrmRef.current?.expressionManager.send({ happy: { value: 0.3 } })
  recorder.startRecording()
})

// Stop listening while VRM is speaking (avoid self-trigger)
useEffect(() => {
  if (agent.isProcessing) wakeWord.stop()
  else wakeWord.start()
}, [agent.isProcessing])
```

### Implementation

- Uses **Porcupine Web SDK** (`@picovoice/porcupine-web`) — runs as WASM in the browser
- Requests mic permission via `navigator.mediaDevices.getUserMedia`
- Porcupine processes audio frames continuously, fires callback on keyword detection
- Mic stream is shared — if `useVRMVowelAnalyser` also needs the mic, they should share the same `AudioContext` / `MediaStream`
- Cleanup: stop Porcupine + release mic stream on unmount

### Dependencies

```json
{
  "@picovoice/porcupine-web": "^3.x"
}
```

This is an **optional peer dependency** — only needed if you use `useWakeWord`. Users who don't need wake word detection don't install it. The hook should throw a clear error if the package is missing.

### Story

```typescript
// Demonstrates wake word detection
// Shows "Listening..." status, then "Wake word detected!" when triggered
// Includes a VRM that shows a listening expression on detection
```

---

## Files to Modify

| File                                                                    | Change                                                   |
| ----------------------------------------------------------------------- | -------------------------------------------------------- |
| `src/use-vrm-expression-manager/index.ts`                               | Add `blendTime` option, crossfade logic, `stop()` method |
| `src/vrm-model/vrm-model.tsx`                                           | Expose `stop()` via ref, pass `blendTime` option         |
| `src/use-vrm-expression-manager/use-vrm-expression-manager.stories.tsx` | Add story demonstrating crossfade between expressions    |

New files:
| File | Description |
|------|-------------|
| `src/use-wake-word/index.ts` | Wake word detection hook |
| `src/use-wake-word/use-wake-word.stories.tsx` | Story demonstrating wake word detection |

No changes needed:

- `src/use-vrm-animation-manager/index.ts` — already crossfades
- `src/use-vrm-blink/index.ts` — unaffected
- `src/use-vrm-breathing/index.ts` — unaffected

### New hook checklist (per CLAUDE.md)

1. Add `src/use-wake-word/index.ts` to `vite.config.ts` → `pack.entry`
2. Add export to `package.json` → `exports`: `"./use-wake-word": "./src/use-wake-word.ts"`
3. Add `@picovoice/porcupine-web` as optional peer dependency in `package.json`
4. Write Storybook story in `src/use-wake-word/use-wake-word.stories.tsx`
5. Add usage documentation to `README.md`

---

## Backward Compatibility

- `blendTime` defaults to 0.3s — existing code that doesn't pass it gets smooth blending (improvement, not breaking)
- `send()` with `hold` and `decay` still works — hold delays decay, decay overrides the blend target to 0
- `send({ happy: 1 })` without options still works — just now blends in instead of snapping
- The only potentially breaking change: previous expressions now decay out over `blendTime` instead of zeroing instantly. If anyone depends on the instant-zero behavior, they can set `blendTime: 0`

---

## New Story: Expression Crossfade

```typescript
// Demonstrates expressions crossfading between states
// Buttons cycle through: neutral → happy → thinking → sad → neutral
// Each click calls send() and the VRM smoothly transitions
```

---

## Verification

### Expression crossfade

1. **Crossfade**: Click "happy" → click "sad" → VRM smoothly transitions from happy to sad (no snap)
2. **Stop**: Click "happy" → click "stop" → VRM smoothly returns to neutral
3. **Hold + decay still works**: `send({ happy: { value: 1, hold: 2, decay: 0.5 } })` → holds for 2s → decays over 0.5s
4. **Rapid send**: Click expressions quickly → VRM doesn't glitch, smoothly chases the latest target
5. **Blink unaffected**: Auto-blink continues working during expression changes
6. **Animation manager**: Confirm `send("greeting")` → `send("nod")` still crossfades correctly (no changes, just verify)

### Wake word

7. **Detection**: Say "Hey Miku" → callback fires → VRM shows listening expression
8. **Stop/start**: Call `stop()` → say wake word → nothing happens. Call `start()` → say wake word → detected
9. **No self-trigger**: While VRM is speaking (TTS playing), wake word listener is stopped, doesn't trigger on VRM's own voice
10. **Missing dependency**: If `@picovoice/porcupine-web` is not installed, hook throws a clear error message
11. **Cleanup**: Unmount component → mic stream released, Porcupine stopped
