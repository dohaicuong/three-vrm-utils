import type { VRM } from '@pixiv/three-vrm'
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

const NOSE_TIP = 4

interface UseWebcamLookAtOptions {
  /** Lerp factor 0-1, higher = snappier (default: 0.05) */
  smoothing?: number
  /** Frames to skip between detections (default: 1 = every other frame) */
  frameSkip?: number
  /** Frames without a face before falling back to camera (default: 30) */
  fallbackFrames?: number
}

export function useWebcamLookAt(
  vrm: VRM,
  videoRef: React.RefObject<HTMLVideoElement | null>,
  { smoothing = 0.05, frameSkip = 1, fallbackFrames = 30 }: UseWebcamLookAtOptions = {},
) {
  const { camera } = useThree()

  const landmarkerRef = useRef<FaceLandmarker | null>(null)
  const targetRef = useRef<Vector3>(new Vector3())
  const frameCountRef = useRef(0)
  const noFaceRef = useRef(0)
  const lastTimeRef = useRef(-1)

  useEffect(() => {
    let stream: MediaStream

    const setup = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm',
      )

      landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })
      if (videoRef.current) videoRef.current.srcObject = stream
    }

    setup().catch((err) => console.error('useWebcamLookAt: setup error', err))

    return () => {
      stream?.getTracks().forEach((t) => t.stop())
      landmarkerRef.current?.close()
      landmarkerRef.current = null
    }
  }, [])

  useFrame(() => {
    if (!vrm.lookAt) return

    const landmarker = landmarkerRef.current
    frameCountRef.current++

    if (
      videoRef.current &&
      landmarker &&
      videoRef.current.readyState >= 2 &&
      frameCountRef.current % (frameSkip + 1) === 0
    ) {
      const now = performance.now()
      if (now !== lastTimeRef.current) {
        lastTimeRef.current = now
        const result = landmarker.detectForVideo(videoRef.current, now)
        const landmarks = result.faceLandmarks?.[0]

        if (landmarks) {
          noFaceRef.current = 0
          const nose = landmarks[NOSE_TIP]

          const rawX = 0.5 - nose.x
          const rawY = -(nose.y - 0.35) // offset: webcam above face, head ~middle of monitor

          // Power curve — biases toward center without a hard dead zone
          const ndcX = Math.sign(rawX) * Math.pow(Math.abs(rawX) * 2, 3)
          const ndcY = Math.sign(rawY) * Math.pow(Math.abs(rawY) * 2, 3)

          const worldPos = new Vector3(ndcX, ndcY, 0.5)
            .unproject(camera)
            .sub(camera.position)
            .normalize()
            .multiplyScalar(5)
            .add(camera.position)
          targetRef.current.lerp(worldPos, smoothing)
        } else {
          noFaceRef.current++
        }
      }
    }

    if (noFaceRef.current > fallbackFrames) {
      targetRef.current.lerp(camera.position, smoothing)
    }

    vrm.lookAt.lookAt(targetRef.current)
  })

  return { targetRef }
}
