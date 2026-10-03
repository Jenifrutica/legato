import { useEffect, useRef } from 'react'
import type { AnalyserLike } from '../player'

export function WaveBars({ analyser, active }: { analyser: AnalyserLike | null; active: boolean }) {
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
      const levels = active ? (analyser?.getLevels() ?? new Uint8Array(0)) : new Uint8Array(0)
      const bars = 42
      const gap = 2
      const barWidth = Math.max(1, width / bars - gap)

      for (let index = 0; index < bars; index++) {
        const raw =
          levels.length === 0 ? 0 : (levels[Math.floor((index / bars) * levels.length)] ?? 0) / 255
        const barHeight = active ? Math.max(2, raw * height) : 2
        const x = index * (barWidth + gap)
        const y = (height - barHeight) / 2

        context.fillStyle =
          index % 5 === 0
            ? `rgba(228, 87, 46, ${active ? 0.35 + raw * 0.5 : 0.25})`
            : `rgba(31, 122, 140, ${active ? 0.3 + raw * 0.5 : 0.22})`
        context.beginPath()
        context.roundRect(x, y, barWidth, barHeight, barWidth / 2)
        context.fill()
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

  return <canvas aria-hidden="true" className="h-8 w-full max-w-xl" ref={canvasRef} />
}
