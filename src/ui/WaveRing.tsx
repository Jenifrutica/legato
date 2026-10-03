import { useEffect, useRef } from 'react'
import type { AnalyserLike } from '../player'

type Palette = {
  primary: string
  accent: string
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

function readPalette(): Palette {
  if (typeof document === 'undefined') {
    return { primary: '124, 92, 255', accent: '0, 168, 181' }
  }

  const styles = getComputedStyle(document.documentElement)
  return {
    primary: parseHex(styles.getPropertyValue('--color-primary')) ?? '124, 92, 255',
    accent: parseHex(styles.getPropertyValue('--color-accent')) ?? '0, 168, 181',
  }
}

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
    let paletteTick = 0
    let palette = readPalette()

    const draw = (time: number) => {
      const size = canvas.clientWidth
      if (size === 0) {
        return
      }

      if (canvas.width !== size || canvas.height !== size) {
        canvas.width = size
        canvas.height = size
      }

      paletteTick++
      if (paletteTick % 30 === 0) {
        palette = readPalette()
      }

      context.clearRect(0, 0, size, size)
      const levels = activeRef.current
        ? (analyser?.getLevels() ?? new Uint8Array(0))
        : new Uint8Array(0)
      const bars = 96
      const center = size / 2
      const baseRadius = size * 0.49
      const seconds = time / 1000

      let bass = 0
      if (levels.length > 0) {
        const bassBins = Math.max(1, Math.floor(levels.length * 0.06))
        for (let index = 0; index < bassBins; index++) {
          bass += levels[index] ?? 0
        }
        bass = bass / (bassBins * 255)
      } else {
        bass = 0.45 + 0.45 * Math.sin(seconds * 3.1)
      }
      const beat = Math.pow(Math.max(0, Math.sin(seconds * 3.4)), 6)
      const pulse = 1 + bass * 0.6 + beat * 0.9

      for (let index = 0; index < bars; index++) {
        const angle = (index / bars) * Math.PI * 2
        if (arcRef.current === 'right' && Math.cos(angle) < -0.15) {
          continue
        }

        const raw =
          levels.length === 0
            ? 0.18 + 0.14 * Math.sin(seconds * 1.6 + index * 0.3)
            : (levels[Math.floor((index / bars) * levels.length)] ?? 0) / 255
        const intensity = Math.max(0.04, Math.min(1, raw))
        const length = 6 + intensity * size * (activeRef.current ? 0.18 : 0.08) * pulse
        const startX = center + Math.cos(angle) * baseRadius
        const startY = center + Math.sin(angle) * baseRadius
        const endX = center + Math.cos(angle) * (baseRadius + length)
        const endY = center + Math.sin(angle) * (baseRadius + length)

        const color = index % 2 === 0 ? palette.primary : palette.accent
        context.shadowBlur = 12
        context.shadowColor = `rgba(${color}, 0.85)`
        context.strokeStyle = `rgba(${color}, ${0.45 + intensity * 0.55})`
        context.lineWidth = 4
        context.lineCap = 'round'
        context.beginPath()
        context.moveTo(startX, startY)
        context.lineTo(endX, endY)
        context.stroke()
        context.shadowBlur = 0
      }
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
      className="pointer-events-none absolute -inset-8 h-[calc(100%+4rem)] w-[calc(100%+4rem)] sm:-inset-12 sm:h-[calc(100%+6rem)] sm:w-[calc(100%+6rem)]"
      ref={canvasRef}
    />
  )
}
