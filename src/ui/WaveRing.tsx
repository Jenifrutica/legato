import { useEffect, useRef } from 'react'
import { BeatDetector, useWavesStore } from '../player'
import type { AnalyserLike } from '../player'

type Inks = {
  accent: string
  ink: string
  paper: string
}

function lastIndexAtMost(values: number[], time: number): number {
  let low = 0
  let high = values.length - 1
  let found = -1

  while (low <= high) {
    const mid = (low + high) >> 1
    if ((values[mid] ?? 0) <= time) {
      found = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  return found
}

function fallbackBass(levels: Uint8Array): number {
  const bins = Math.max(1, Math.min(3, levels.length))
  let sum = 0
  for (let index = 0; index < bins; index++) {
    sum += levels[index] ?? 0
  }
  return sum / (bins * 255)
}

function parseHex(value: string): string | null {
  const hex = value.trim().replace('#', '')
  if (hex.length !== 6) {
    return null
  }

  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)
  return Number.isNaN(r + g + b) ? null : `${r}, ${g}, ${b}`
}

function readInks(): Inks {
  if (typeof document === 'undefined') {
    return { accent: '255, 91, 46', ink: '19, 16, 12', paper: '251, 248, 241' }
  }

  const styles = getComputedStyle(document.documentElement)
  return {
    accent: parseHex(styles.getPropertyValue('--color-accent')) ?? '255, 91, 46',
    ink: parseHex(styles.getPropertyValue('--color-ink')) ?? '19, 16, 12',
    paper: parseHex(styles.getPropertyValue('--color-surface')) ?? '251, 248, 241',
  }
}

/**
 * Ondas de líneas planas que salen del disco, en las dos tintas del álbum,
 * con grosores alternados al estilo de la tipografía. Sin glow ni blur.
 */
export function WaveRing({
  analyser,
  active,
  arc = 'full',
  position = null,
  beats = null,
  bpmOverride = null,
  offsetOverride = null,
}: {
  analyser: AnalyserLike | null
  active: boolean
  arc?: 'full' | 'right'
  /** Posición de la pista en segundos (para anclar el pulso sintético). */
  position?: number | null
  /** Rejilla de golpes (Spotify) en segundos. */
  beats?: number[] | null
  /** BPM de la pista que gana sobre el BPM manual global. */
  bpmOverride?: number | null
  /** Fase de la pista (tap tempo) que gana sobre la fase global. */
  offsetOverride?: number | null
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeRef = useRef(active)
  activeRef.current = active
  const arcRef = useRef(arc)
  arcRef.current = arc
  const sensitivity = useWavesStore((state) => state.sensitivity)
  const bpm = useWavesStore((state) => state.bpm)
  const offset = useWavesStore((state) => state.offsetSeconds)
  const sensitivityRef = useRef(sensitivity)
  sensitivityRef.current = sensitivity
  const bpmRef = useRef(bpm)
  bpmRef.current = bpm
  const offsetRef = useRef(offset)
  offsetRef.current = offset
  const positionRef = useRef(position)
  positionRef.current = position
  const beatsRef = useRef(beats)
  beatsRef.current = beats
  const bpmOverrideRef = useRef(bpmOverride)
  bpmOverrideRef.current = bpmOverride
  const offsetOverrideRef = useRef(offsetOverride)
  offsetOverrideRef.current = offsetOverride

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) {
      return
    }

    const context = canvas.getContext('2d')
    if (context === null) {
      return
    }

    let frame = 0
    let last = 0
    let inkTick = 0
    let inks = readInks()
    const detector = new BeatDetector(sensitivityRef.current)
    const segmentSmooth: number[] = []
    let anchorPosition = positionRef.current
    let anchorAt = 0
    let lastPosition = positionRef.current

    const reduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.classList.contains('a11y-reduced-motion')

    const draw = (time: number, active: boolean) => {
      const size = canvas.clientWidth
      if (size === 0) {
        return
      }

      if (canvas.width !== size || canvas.height !== size) {
        canvas.width = size
        canvas.height = size
      }

      inkTick++
      if (inkTick % 30 === 0) {
        inks = readInks()
      }

      context.clearRect(0, 0, size, size)
      const levels = analyser?.getLevels() ?? new Uint8Array(0)
      let energySum = 0
      for (const level of levels) {
        energySum += level
      }
      const hasSignal = energySum > 0
      const center = size / 2
      const base = size * 0.314
      const seconds = time / 1000
      const segments = 110

      // Posición estimada de la pista entre sondeos: se ancla en cada cambio
      // real de posición y avanza con el reloj del navegador.
      const currentPosition = positionRef.current
      if (currentPosition !== lastPosition) {
        lastPosition = currentPosition
        anchorPosition = currentPosition
        anchorAt = time
      }
      const estimatedPosition =
        anchorPosition === null || anchorAt === 0
          ? anchorPosition
          : anchorPosition + (time - anchorAt) / 1000

      let beat = 0
      let pulse = 1

      if (active && hasSignal) {
        // Golpes reales: analizador dedicado al bombo (40–150 Hz, sin suavizado);
        // si el analizador no lo expone, se usa la banda baja del espectro.
        const bass =
          typeof analyser?.getBeatBass === 'function'
            ? analyser.getBeatBass()
            : fallbackBass(levels)
        detector.setSensitivity(sensitivityRef.current)
        beat = detector.process(bass, time)
        pulse = 1 + beat * 2.4
      } else if (active) {
        // Sin señal analizable (Spotify por DRM): si Spotify publicó su
        // rejilla de golpes, el pulso cae exactamente en cada beat; si no,
        // pulso sintético al BPM de la pista o al manual global.
        detector.reset()
        const beatList = beatsRef.current
        const now = estimatedPosition
        if (beatList !== null && beatList.length > 0 && now !== null) {
          const index = lastIndexAtMost(beatList, now)
          if (index >= 0) {
            const delta = now - (beatList[index] ?? 0)
            beat = delta >= 0 && delta <= 0.45 ? Math.pow(0.5, delta / 0.13) : 0
          }
          pulse = 1 + beat * 2.2
        } else {
          const bpmValue = bpmOverrideRef.current ?? bpmRef.current ?? 120
          const beatsPerSecond = bpmValue / 60
          const offsetValue = offsetOverrideRef.current ?? offsetRef.current
          const base = (now ?? time / 1000) - offsetValue
          const phase = (((base * beatsPerSecond) % 1) + 1) % 1
          const kick = Math.pow(1 - phase, 8)
          beat = kick
          pulse = 1 + kick * 2.2
        }
      } else {
        // En reposo: líneas cortas y quietas (sin movimiento por tiempo).
        detector.reset()
        beat = 0
        pulse = 1
      }

      type Segment = {
        x0: number
        y0: number
        x1: number
        y1: number
        width: number
        index: number
        intensity: number
      }
      const drawn: Segment[] = []

      for (let index = 0; index < segments; index++) {
        const angle = (index / segments) * Math.PI * 2 - Math.PI / 2
        if (arcRef.current === 'right' && Math.cos(angle) < -0.2) {
          continue
        }

        const raw =
          active && hasSignal
            ? (levels[Math.floor((index / segments) * levels.length)] ?? 0) / 255
            : active
              ? 0.14 + 0.12 * Math.sin(seconds * 1.5 + index * 0.42) + 0.35 * beat
              : 0.24 + 0.08 * Math.sin(index * 0.7)
        const smoothed = (segmentSmooth[index] ?? 0) * 0.6 + raw * 0.4
        segmentSmooth[index] = smoothed
        const intensity = Math.max(0.1, Math.min(1, Math.sqrt(smoothed)))
        const downScale = 1 - Math.max(0, Math.sin(angle)) * 0.7
        const wavePart = active ? 0.05 : 0.02
        const length = (8 + intensity * size * wavePart) * pulse * downScale
        const radius = base + beat * size * 0.035
        const x0 = center + Math.cos(angle) * radius
        const y0 = center + Math.sin(angle) * radius
        const x1 = center + Math.cos(angle) * (radius + length)
        const y1 = center + Math.sin(angle) * (radius + length)

        drawn.push({
          x0,
          y0,
          x1,
          y1,
          width: index % 12 === 0 ? 3.2 : index % 4 === 0 ? 2.2 : 1.4,
          index,
          intensity,
        })
      }

      const paint = (color: (segment: Segment) => string, curveColor: string) => {
        context.lineCap = 'butt'
        for (const segment of drawn) {
          context.globalAlpha = 0.2 + segment.intensity * 0.2 + beat * 0.6
          context.strokeStyle = color(segment)
          context.lineWidth = segment.width
          context.beginPath()
          context.moveTo(segment.x0, segment.y0)
          context.lineTo(segment.x1, segment.y1)
          context.stroke()
        }

        // Línea fina que envuelve las puntas y dibuja la curva de la onda.
        if (drawn.length > 2) {
          context.globalAlpha = 0.25 + beat * 0.6
          context.strokeStyle = curveColor
          context.lineWidth = 1.2
          context.lineJoin = 'round'
          context.beginPath()
          const first = drawn[0]
          const last = drawn[drawn.length - 1]
          context.moveTo((first.x1 + last.x1) / 2, (first.y1 + last.y1) / 2)
          for (let index = 0; index < drawn.length; index++) {
            const tip = drawn[index]
            const next = drawn[(index + 1) % drawn.length]
            context.quadraticCurveTo(tip.x1, tip.y1, (tip.x1 + next.x1) / 2, (tip.y1 + next.y1) / 2)
          }
          context.closePath()
          context.stroke()
          context.globalAlpha = 1
        }
      }

      // Sobre el campo de tinta directa las líneas van en papel; fuera, en tinta/acento.
      const fieldHalfWidth = size * 0.341
      const fieldBottom = center + size * 0.235

      context.save()
      context.beginPath()
      context.rect(center - fieldHalfWidth, -size, fieldHalfWidth * 2, fieldBottom + size)
      context.clip()
      paint(() => inks.paper, inks.paper)
      context.restore()

      context.save()
      context.beginPath()
      context.rect(0, 0, size, size)
      context.rect(center - fieldHalfWidth, -size, fieldHalfWidth * 2, fieldBottom + size)
      context.clip('evenodd')
      paint((segment) => (segment.index % 5 === 0 ? inks.accent : inks.ink), inks.ink)
      context.restore()
    }

    if (reduced) {
      draw(1200, activeRef.current)
      return
    }

    // Un cuadro en reposo al montar para que el anillo no arranque vacío.
    draw(performance.now(), activeRef.current)
    let wasActive = activeRef.current

    const loop = (time: number) => {
      frame = requestAnimationFrame(loop)
      if (time - last < 33) {
        return
      }
      last = time

      if (document.hidden || canvas.offsetParent === null) {
        return
      }

      const active = activeRef.current
      // En reposo se dibuja un único cuadro quieto y se deja de repintar.
      if (!active && !wasActive) {
        return
      }

      // Al arrancar (o reanudar) se reancla el pulso a la posición real para
      // que la pausa no desfase los golpes.
      if (active && !wasActive) {
        anchorPosition = positionRef.current
        lastPosition = positionRef.current
        anchorAt = time
      }

      draw(time, active)
      wasActive = active
    }

    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [analyser])

  return (
    <canvas
      aria-hidden="true"
      className="pointer-events-none absolute -inset-[35%] h-[170%] w-[170%]"
      ref={canvasRef}
    />
  )
}
