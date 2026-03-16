import type { VRM } from '@pixiv/three-vrm'
import { createVRMAnimationClip, VRMAnimationLoaderPlugin } from '@pixiv/three-vrm-animation'
import { useAnimations } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { useEffect } from 'react'
import type { AnimationAction } from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

export function useVRMAnimations<T extends string>(vrm: VRM, motions: Record<T, string>) {
  const names = Object.keys(motions)
  const paths = Object.values(motions) as string[]

  const animGltfs = useLoader(GLTFLoader, paths, (loader) =>
    loader.register((parser) => new VRMAnimationLoaderPlugin(parser)),
  )

  const clips = animGltfs.map((gltf, index) => {
    const clip = createVRMAnimationClip(gltf.userData.vrmAnimations[0], vrm)
    clip.name = names[index]
    clip.tracks = clip.tracks.filter(
      (t) => !t.name.includes('VRMExpression') && !t.name.includes('VRMLookAt'),
    )
    return clip
  })
  const animations = useAnimations(clips, vrm.scene)

  useEffect(() => {
    for (const clip of clips) {
      animations.mixer.clipAction(clip)
    }
  }, [clips, animations.mixer])

  return {
    ...animations,
    actions: animations.actions as Record<T, AnimationAction>,
  }
}
