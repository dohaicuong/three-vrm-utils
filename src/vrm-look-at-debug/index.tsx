import type { VRM } from '@pixiv/three-vrm'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, BufferGeometry, Float32BufferAttribute } from 'three'

interface VRMLookAtDebugProps {
  vrm: VRM
  targetRef: React.RefObject<Vector3>
}

export function VRMLookAtDebug({ vrm, targetRef }: VRMLookAtDebugProps) {
  const geometryRef = useRef<BufferGeometry>(null)

  useFrame(() => {
    if (!targetRef.current || !geometryRef.current) return

    const leftEye = vrm.humanoid.getRawBoneNode('leftEye')
    const rightEye = vrm.humanoid.getRawBoneNode('rightEye')
    if (!leftEye || !rightEye) return

    const leftPos = new Vector3()
    const rightPos = new Vector3()
    leftEye.getWorldPosition(leftPos)
    rightEye.getWorldPosition(rightPos)
    const eyeMid = leftPos.add(rightPos).multiplyScalar(0.5)

    const positions = new Float32Array([
      eyeMid.x,
      eyeMid.y,
      eyeMid.z,
      targetRef.current.x,
      targetRef.current.y,
      targetRef.current.z,
    ])

    geometryRef.current.setAttribute('position', new Float32BufferAttribute(positions, 3))
  })

  return (
    <line>
      <bufferGeometry ref={geometryRef} />
      <lineBasicMaterial color="red" />
    </line>
  )
}
