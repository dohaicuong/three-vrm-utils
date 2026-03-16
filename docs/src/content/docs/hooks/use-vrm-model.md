---
title: useVRMModel
description: Load a VRM model with optimized defaults.
---

Loads a VRM model with optimized defaults. Automatically uses `MToonNodeMaterial` when a WebGPU renderer is detected.

## Usage

```tsx
import { useVRMModel } from 'three-vrm-utils/use-vrm-model'

function VRMModel({ url }: { url: string }) {
  const [gltf, vrm] = useVRMModel(url)
  return <primitive object={vrm.scene} />
}
```

## Returns

Returns a tuple `[gltf, vrm]`:

- `gltf` — the raw GLTF result from `useLoader`
- `vrm` — the parsed `VRM` instance

## What it does

- Registers `VRMLoaderPlugin` with the GLTF loader
- Detects WebGPU renderer and uses `MToonNodeMaterial` when available
- Removes unnecessary vertices (`VRMUtils.removeUnnecessaryVertices`)
- Combines skeletons and morphs for performance
- Rotates the scene 180° (VRM convention)
- Disables frustum culling on all objects
