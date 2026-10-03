import { useEffect, useRef } from 'react'
import type { AnalyserLike } from '../player'

export function WaveRing({ analyser, active }: { analyser: AnalyserLike | null; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    const draw = () => {
      const size = canvas.clientWidth
      if (size === 0) {
        return
      }

      if (canvas.width !== size || canvas.height !== size) {
        canvas.width = size
        canvas.height = size
      }

      context.clearRect(0, 0, size, size)
      const levels = active ? (analyser?.getLevels() ?? new Uint8Array(0)) : new Uint8Array(0)
      const bars = 72
      const center = size / 2
      const baseRadius = size * 0.485

      for (let index = 0; index < bars; index++) {
        const raw =
          levels.length === 0 ? 0 : (levels[Math.floor((index / bars) * levels.length)] ?? 0) / 255
        const intensity = active ? raw : 0
        const angle = (index / bars) * Math.PI * 2
        const length = 3 + intensity * size * 0.07
        const startX = center + Math.cos(angle) * baseRadius
        const startY = center + Math.sin(angle) * baseRadius
        const endX = center + Math.cos(angle) * (baseRadius + length)
        const endY = center + Math.sin(angle) * (baseRadius + length)

        context.strokeStyle = `rgba(31, 122, 140, ${active ? 0.22 + intensity * 0.55 : 0.16})`
        context.lineWidth = 2
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

      draw()
    }

    if (active) {
      frame = requestAnimationFrame(loop)
    } else {
      draw()
    }

    return () => cancelAnimationFrame(frame)
  }, [analyser, active])

  return (
    <canvas
      aria-hidden="true"
      className="pointer-events-none absolute -inset-6 h-[calc(100%+3rem)] w-[calc(100%+3rem)] sm:-inset-10 sm:h-[calc(100%+5rem)] sm:w-[calc(100%+5rem)]"
      ref={canvasRef}
    />
  )
}
