import { useEffect, useRef } from 'react'
import type { AnalyserLike } from '../player'

export function WaveRing({ analyser, active }: { analyser: AnalyserLike | null; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeRef = useRef(active)
  activeRef.current = active

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

    const draw = (time: number) => {
      const size = canvas.clientWidth
      if (size === 0) {
        return
      }

      if (canvas.width !== size || canvas.height !== size) {
        canvas.width = size
        canvas.height = size
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
      const pulse = 1 + bass * 0.65

      for (let index = 0; index < bars; index++) {
        const raw =
          levels.length === 0
            ? 0.18 + 0.14 * Math.sin(seconds * 1.6 + index * 0.3)
            : (levels[Math.floor((index / bars) * levels.length)] ?? 0) / 255
        const intensity = Math.max(0.04, Math.min(1, raw))
        const angle = (index / bars) * Math.PI * 2
        const length = 6 + intensity * size * (activeRef.current ? 0.18 : 0.08) * pulse
        const startX = center + Math.cos(angle) * baseRadius
        const startY = center + Math.sin(angle) * baseRadius
        const endX = center + Math.cos(angle) * (baseRadius + length)
        const endY = center + Math.sin(angle) * (baseRadius + length)

        const hue = Math.round((seconds * 40 + index * 4) % 360)
        context.shadowBlur = 12
        context.shadowColor = `hsla(${hue}, 90%, 62%, 0.85)`
        context.strokeStyle = `hsla(${hue}, 90%, 62%, ${0.5 + intensity * 0.5})`
        context.lineWidth = 4
        context.lineCap = 'round'
        context.beginPath()
        context.moveTo(startX, startY)
        context.lineTo(endX, endY)
        context.stroke()
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
