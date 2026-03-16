# three-vrm-utils

React hooks and utilities for working with [VRM](https://vrm.dev/) avatars in [React Three Fiber](https://github.com/pmndrs/react-three-fiber).

[Storybook](https://dohaicuong.github.io/three-vrm-utils/)

## Install

```bash
npm install three-vrm-utils
```

### Peer dependencies

```bash
npm install react react-dom three @react-three/fiber @pixiv/three-vrm @pixiv/three-vrm-animation
```

## Usage

### useVRMModel

Loads a VRM model with optimized defaults. Automatically uses `MToonNodeMaterial` when a WebGPU renderer is detected.

```tsx
import { useVRMModel } from "three-vrm-utils/use-vrm-model";

function VRMModel({ url }: { url: string }) {
  const [gltf, vrm] = useVRMModel(url);
  return <primitive object={vrm.scene} />;
}
```

### useVRMAnimations

Loads and manages VRM animations from `.vrma` files. Returns typed actions and a mixer for frame updates.

```tsx
import { useVRMModel } from "three-vrm-utils/use-vrm-model";
import { useVRMAnimations } from "three-vrm-utils/use-vrm-animations";
import { useFrame } from "@react-three/fiber";
import { useEffect } from "react";

const motions = {
  idle: "/assets/idle.vrma",
  wave: "/assets/wave.vrma",
};

function AnimatedVRM({ url }: { url: string }) {
  const [, vrm] = useVRMModel(url);
  const { actions } = useVRMAnimations(vrm, motions);

  useEffect(() => {
    actions.idle?.reset().fadeIn(0.3).play();
    return () => {
      actions.idle?.fadeOut(0.3);
    };
  }, [actions]);

  useFrame((_, delta) => {
    vrm.update(delta);
  });

  return <primitive object={vrm.scene} />;
}
```

### useVRMBlink

Adds automatic blinking to a VRM model with configurable timing and double-blink support.

```tsx
import { useVRMModel } from "three-vrm-utils/use-vrm-model";
import { useVRMBlink } from "three-vrm-utils/use-vrm-blink";
import { useFrame } from "@react-three/fiber";

function BlinkingVRM({ url }: { url: string }) {
  const [, vrm] = useVRMModel(url);
  useVRMBlink(vrm, {
    minInterval: 2.5,
    maxInterval: 5.5,
    doubleBlinkChance: 0.12,
  });

  useFrame((_, delta) => {
    vrm.update(delta);
  });

  return <primitive object={vrm.scene} />;
}
```

## License

MIT
