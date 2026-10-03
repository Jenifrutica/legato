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

    const render = () => {
      frame = requestAnimationFrame(render)
      const size = canvas.clientWidth
      if (size === 0) {
        return
      }

      if (canvas.width !== size || canvas.height !== size) {
        canvas.width = size
        canvas.height = size
      }

      context.clearRect(0, 0, size, size)
      const levels = analyser?.getLevels() ?? new Uint8Array(0)
      const bars = 72
      const center = size / 2
      const baseRadius = size * 0.485

      for (let index = 0; index < bars; index++) {
        const raw =
          levels.length === 0 ? 0 : (levels[Math.floor((index / bars) * levels.length)] ?? 0) / 255
        const intensity = activeRef.current ? raw : raw * 0.25
        const angle = (index / bars) * Math.PI * 2
        const length = 3 + intensity * size * 0.07
        const startX = center + Math.cos(angle) * baseRadius
        const startY = center + Math.sin(angle) * baseRadius
        const endX = center + Math.cos(angle) * (baseRadius + length)
        const endY = center + Math.sin(angle) * (baseRadius + length)

        context.strokeStyle = `rgba(31, 122, 140, ${0.22 + intensity * 0.55})`
        context.lineWidth = 2
        context.lineCap = 'round'
        context.beginPath()
        context.moveTo(startX, startY)
        context.lineTo(endX, endY)
        context.stroke()
      }
    }

    render()
    return () => cancelAnimationFrame(frame)
  }, [analyser])

  return (
    <canvas
      aria-hidden="true"
      className="pointer-events-none absolute -inset-6 h-[calc(100%+3rem)] w-[calc(100%+3rem)] sm:-inset-10 sm:h-[calc(100%+5rem)] sm:w-[calc(100%+5rem)]"
      ref={canvasRef}
    />
  )
}
