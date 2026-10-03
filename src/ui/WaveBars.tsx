import { useEffect, useRef } from 'react'
import type { AnalyserLike } from '../player'

export function WaveBars({ analyser, active }: { analyser: AnalyserLike | null; active: boolean }) {
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
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (width === 0 || height === 0) {
        return
      }

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      context.clearRect(0, 0, width, height)
      const levels = analyser?.getLevels() ?? new Uint8Array(0)
      const bars = 42
      const gap = 2
      const barWidth = Math.max(1, width / bars - gap)

      for (let index = 0; index < bars; index++) {
        const raw =
          levels.length === 0 ? 0 : (levels[Math.floor((index / bars) * levels.length)] ?? 0) / 255
        const intensity = activeRef.current ? raw : raw * 0.2
        const barHeight = Math.max(2, intensity * height)
        const x = index * (barWidth + gap)
        const y = (height - barHeight) / 2

        context.fillStyle =
          index % 5 === 0
            ? `rgba(228, 87, 46, ${0.35 + intensity * 0.5})`
            : `rgba(31, 122, 140, ${0.3 + intensity * 0.5})`
        context.beginPath()
        context.roundRect(x, y, barWidth, barHeight, barWidth / 2)
        context.fill()
      }
    }

    render()
    return () => cancelAnimationFrame(frame)
  }, [analyser])

  return <canvas aria-hidden="true" className="h-8 w-full max-w-xl" ref={canvasRef} />
}
