---
title: useWakeWord
description: Client-side wake word detection using Hey Buddy. Runs entirely in the browser — no API key required.
---

Detects wake words using [Hey Buddy](https://huggingface.co/benjamin-paine/hey-buddy), which runs ONNX models entirely in the browser via WebAssembly. No audio leaves the device and no API key is needed.

## Prerequisites

You need a `.onnx` wake word model file. You can either:

- Use a [pre-trained model](https://huggingface.co/benjamin-paine/hey-buddy/tree/main/models) (~1.2 MB each)
- Train your own with the Hey Buddy Python CLI: `heybuddy train "hey miku"`

Place the `.onnx` file in your app's public directory.

The hook loads `onnxruntime-web` and `hey-buddy-onnx` from CDN automatically at runtime — no npm install required for these.

## Usage

```tsx
import { useWakeWord } from 'three-vrm-utils/use-wake-word'

function App() {
  const wakeWord = useWakeWord({ modelPath: '/models/hey-miku.onnx' }, (label) => {
    console.log(`Wake word detected: ${label}`)
  })

  return <div>{wakeWord.isListening ? 'Listening...' : 'Paused'}</div>
}
```

### With VRM expressions

```tsx
import { useRef } from 'react'
import { VRMModel, type VRMModelRef } from 'three-vrm-utils/vrm-model'
import { useWakeWord } from 'three-vrm-utils/use-wake-word'

function App({ isSpeaking }: { isSpeaking: boolean }) {
  const ref = useRef<VRMModelRef>(null)

  const wakeWord = useWakeWord({ modelPath: '/models/hey-miku.onnx' }, (label) => {
    ref.current?.expressionManager.send({ happy: 0.3 })
  })

  // Stop listening while VRM is speaking to avoid self-trigger
  useEffect(() => {
    if (isSpeaking) wakeWord.stop()
    else wakeWord.start()
  }, [isSpeaking])

  return <VRMModel ref={ref} url="/model.vrm" blink breathing />
}
```

## Options

| Option      | Type                 | Default | Description                                   |
| ----------- | -------------------- | ------- | --------------------------------------------- |
| `modelPath` | `string \| string[]` | —       | Path(s) to `.onnx` wake word model files      |
| `record`    | `boolean`            | `false` | Capture audio from wake word to end of speech |
| `autoStart` | `boolean`            | `true`  | Start listening on mount                      |

## Returns

| Property      | Type         | Description                            |
| ------------- | ------------ | -------------------------------------- |
| `isListening` | `boolean`    | Whether the hook is actively listening |
| `start`       | `() => void` | Start listening for the wake word      |
| `stop`        | `() => void` | Stop listening and release mic         |

## Callback

The second argument is called when a wake word is detected:

```tsx
useWakeWord(options, (label: string) => {
  // label is the model filename without extension
  // e.g. "hey-miku" for hey-miku.onnx
})
```

When using multiple models, `label` tells you which one triggered.
