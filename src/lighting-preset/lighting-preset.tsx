export interface LightingPresetProps {
  /** Preset name. Default: "warm" */
  preset?: 'warm' | 'neutral' | 'cool'
  /** Global intensity multiplier. Default: 1 */
  intensity?: number
}

const presets = {
  warm: {
    ambient: { intensity: 1.6, color: '#ffe8d0' },
    front: { position: [0, 0.5, 5] as const, intensity: 0.7, color: '#ffdcc0' },
    key: { position: [2, 3, 3] as const, intensity: 0.5, color: '#ffe0c8' },
    rim: { position: [-2, 2, -3] as const, intensity: 0.25 },
  },
  neutral: {
    ambient: { intensity: 1.6, color: '#ffffff' },
    front: { position: [0, 0.5, 5] as const, intensity: 0.7, color: '#ffffff' },
    key: { position: [2, 3, 3] as const, intensity: 0.5, color: '#ffffff' },
    rim: { position: [-2, 2, -3] as const, intensity: 0.25 },
  },
  cool: {
    ambient: { intensity: 1.6, color: '#d0e8ff' },
    front: { position: [0, 0.5, 5] as const, intensity: 0.7, color: '#c0dcff' },
    key: { position: [2, 3, 3] as const, intensity: 0.5, color: '#c8e0ff' },
    rim: { position: [-2, 2, -3] as const, intensity: 0.25 },
  },
}

export function LightingPreset({ preset = 'warm', intensity = 1 }: LightingPresetProps = {}) {
  const p = presets[preset]

  return (
    <>
      <ambientLight intensity={p.ambient.intensity * intensity} color={p.ambient.color} />
      <directionalLight
        position={p.front.position}
        intensity={p.front.intensity * intensity}
        color={p.front.color}
      />
      <directionalLight
        position={p.key.position}
        intensity={p.key.intensity * intensity}
        color={p.key.color}
      />
      <directionalLight position={p.rim.position} intensity={p.rim.intensity * intensity} />
    </>
  )
}
