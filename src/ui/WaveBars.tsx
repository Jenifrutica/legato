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
    let last = 0

    const draw = (time: number) => {
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
      const levels = activeRef.current
        ? (analyser?.getLevels() ?? new Uint8Array(0))
        : new Uint8Array(0)
      const bars = 56
      const gap = 2
      const barWidth = Math.max(1, width / bars - gap)
      const seconds = time / 1000

      for (let index = 0; index < bars; index++) {
        const raw =
          levels.length === 0
            ? 0.22 +
              0.18 * Math.sin(seconds * 2 + index * 0.42) +
              0.08 * Math.sin(seconds * 5 + index)
            : (levels[Math.floor((index / bars) * levels.length)] ?? 0) / 255
        const intensity = Math.max(0.06, Math.min(1, raw))
        const barHeight = Math.max(3, intensity * height * (activeRef.current ? 1 : 0.75))
        const x = index * (barWidth + gap)
        const y = (height - barHeight) / 2
        const gradient = context.createLinearGradient(0, y, 0, y + barHeight)
        gradient.addColorStop(0, `rgba(124, 92, 255, ${0.35 + intensity * 0.6})`)
        gradient.addColorStop(0.5, `rgba(0, 168, 181, ${0.4 + intensity * 0.55})`)
        gradient.addColorStop(1, `rgba(124, 92, 255, ${0.35 + intensity * 0.6})`)

        context.fillStyle = gradient
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

      draw(time)
    }

    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [analyser])

  return <canvas aria-hidden="true" className="h-16 w-full max-w-2xl" ref={canvasRef} />
}
