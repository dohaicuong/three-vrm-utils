---
title: LightingPreset
description: Pre-configured lighting setups for VRM scenes.
---

A ready-to-use lighting component with warm, neutral, and cool presets — designed for VRM models in React Three Fiber.

## Usage

```tsx
import { LightingPreset } from 'three-vrm-utils/lighting-preset'
;<Canvas>
  <LightingPreset />
  {/* your VRM model */}
</Canvas>
```

## Props

| Prop        | Type                            | Default  | Description                 |
| ----------- | ------------------------------- | -------- | --------------------------- |
| `preset`    | `'warm' \| 'neutral' \| 'cool'` | `'warm'` | Lighting color temperature  |
| `intensity` | `number`                        | `1`      | Global intensity multiplier |

## Presets

### Warm

Soft, warm-toned lighting inspired by VTuber apps. Best for character showcases and conversational scenes.

```tsx
<LightingPreset preset="warm" />
```

### Neutral

Clean white lighting with no color tint. Good for accurate material previews.

```tsx
<LightingPreset preset="neutral" />
```

### Cool

Blue-tinted lighting for cooler, stylized scenes.

```tsx
<LightingPreset preset="cool" />
```
