import { useEffect, useRef } from 'react'
import type { AnalyserLike } from '../player'

type Inks = {
  accent: string
  ink: string
  paper: string
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
}: {
  analyser: AnalyserLike | null
  active: boolean
  arc?: 'full' | 'right'
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeRef = useRef(active)
  activeRef.current = active
  const arcRef = useRef(arc)
  arcRef.current = arc

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

    const reduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.classList.contains('a11y-reduced-motion')

    const draw = (time: number) => {
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
      const levels = activeRef.current
        ? (analyser?.getLevels() ?? new Uint8Array(0))
        : new Uint8Array(0)
      const center = size / 2
      const base = size * 0.314
      const seconds = time / 1000
      const segments = 110

      let bass = 0
      if (levels.length > 0) {
        const bassBins = Math.max(1, Math.floor(levels.length * 0.06))
        for (let index = 0; index < bassBins; index++) {
          bass += levels[index] ?? 0
        }
        bass = bass / (bassBins * 255)
      } else {
        bass = 0.4 + 0.4 * Math.sin(seconds * 2.6)
      }
      const beat = Math.pow(Math.max(0, Math.sin(seconds * 3.2)), 6)
      const pulse = Math.min(2.3, 1 + bass * 0.9 + beat * 1.1)

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
          levels.length === 0
            ? 0.14 + 0.12 * Math.sin(seconds * 1.5 + index * 0.42) + 0.22 * beat
            : (levels[Math.floor((index / segments) * levels.length)] ?? 0) / 255
        const intensity = Math.max(0.12, Math.min(1, Math.sqrt(raw)))
        const downScale = 1 - Math.max(0, Math.sin(angle)) * 0.64
        const length =
          (10 + intensity * size * (activeRef.current ? 0.19 : 0.06) * pulse) * downScale
        const x0 = center + Math.cos(angle) * base
        const y0 = center + Math.sin(angle) * base
        const x1 = center + Math.cos(angle) * (base + length)
        const y1 = center + Math.sin(angle) * (base + length)

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
          context.globalAlpha = 0.35 + segment.intensity * 0.6
          context.strokeStyle = color(segment)
          context.lineWidth = segment.width
          context.beginPath()
          context.moveTo(segment.x0, segment.y0)
          context.lineTo(segment.x1, segment.y1)
          context.stroke()
        }

        // Línea fina que envuelve las puntas y dibuja la curva de la onda.
        if (drawn.length > 2) {
          context.globalAlpha = 0.55
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
      draw(1200)
      return
    }

    const loop = (time: number) => {
      frame = requestAnimationFrame(loop)
      if (time - last < 33) {
        return
      }
      last = time

      if (document.hidden || canvas.offsetParent === null) {
        return
      }

      draw(time)
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
