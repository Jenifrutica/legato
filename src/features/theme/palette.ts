import { isLight, saturation, type Rgb } from './color'

export type ColorCluster = {
  color: Rgb
  count: number
}

export type AlbumPalette = {
  dominant: Rgb
  vibrant: Rgb
  muted: Rgb
  average: Rgb
}

const cache = new Map<string, AlbumPalette>()

function lightness(color: Rgb): number {
  return (Math.max(color.r, color.g, color.b) + Math.min(color.r, color.g, color.b)) / 2 / 255
}

export function extractClusters(data: Uint8ClampedArray): ColorCluster[] {
  const buckets = new Map<number, { count: number; r: number; g: number; b: number }>()

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3]
    if (alpha < 200) {
      continue
    }

    const r = data[index]
    const g = data[index + 1]
    const b = data[index + 2]
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)
    const bucket = buckets.get(key)

    if (bucket === undefined) {
      buckets.set(key, { count: 1, r, g, b })
    } else {
      bucket.count++
      bucket.r += r
      bucket.g += g
      bucket.b += b
    }
  }

  return [...buckets.values()]
    .map((bucket) => ({
      color: {
        r: bucket.r / bucket.count,
        g: bucket.g / bucket.count,
        b: bucket.b / bucket.count,
      },
      count: bucket.count,
    }))
    .sort((a, b) => b.count - a.count)
}

export function derivePalette(clusters: ColorCluster[]): AlbumPalette {
  const total = clusters.reduce((sum, cluster) => sum + cluster.count, 0) || 1

  const average = clusters.reduce(
    (acc, cluster) => ({
      r: acc.r + (cluster.color.r * cluster.count) / total,
      g: acc.g + (cluster.color.g * cluster.count) / total,
      b: acc.b + (cluster.color.b * cluster.count) / total,
    }),
    { r: 0, g: 0, b: 0 },
  )

  const usable = clusters.filter((cluster) => {
    const l = lightness(cluster.color)
    return l > 0.08 && l < 0.92
  })

  const pool = usable.length > 0 ? usable.slice(0, 24) : clusters.slice(0, 12)

  const scored = pool
    .map((cluster) => ({
      ...cluster,
      score: cluster.count * (0.6 + saturation(cluster.color)),
    }))
    .sort((a, b) => b.score - a.score)

  const dominant = scored[0]?.color ?? { r: 228, g: 87, b: 46 }

  const vibrantCandidate = [...pool]
    .filter((cluster) => {
      const l = lightness(cluster.color)
      return l > 0.2 && l < 0.85
    })
    .sort((a, b) => saturation(b.color) * b.count - saturation(a.color) * a.count)[0]

  const vibrant = vibrantCandidate?.color ?? dominant

  const muted = {
    r: dominant.r * 0.55 + average.r * 0.45,
    g: dominant.g * 0.55 + average.g * 0.45,
    b: dominant.b * 0.55 + average.b * 0.45,
  }

  return { dominant, vibrant, muted, average }
}

export async function extractPaletteFromUrl(url: string): Promise<AlbumPalette | null> {
  const cached = cache.get(url)
  if (cached !== undefined) {
    return cached
  }

  try {
    const image = await loadImage(url)
    const size = 48
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d', { willReadFrequently: true })

    if (context === null) {
      return null
    }

    context.drawImage(image, 0, 0, size, size)
    const data = context.getImageData(0, 0, size, size).data
    const palette = derivePalette(extractClusters(data))
    cache.set(url, palette)
    return palette
  } catch {
    return null
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('No se pudo cargar la portada'))
    image.src = url
  })
}

/**
 * Paleta a partir de un fotograma del video (mp4): se toma el inicio para que
 * la interfaz se tiña como con las portadas. Si el video no es del mismo
 * origen, el canvas queda "manchado" y se devuelve null (sin tema).
 */
export async function extractPaletteFromVideo(url: string): Promise<AlbumPalette | null> {
  const key = `video:${url}`
  const cached = cache.get(key)
  if (cached !== undefined) {
    return cached
  }

  try {
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.crossOrigin = 'anonymous'
    video.src = url

    await new Promise<void>((resolve, reject) => {
      const done = () => resolve()
      video.addEventListener('loadeddata', done, { once: true })
      video.addEventListener('error', () => reject(new Error('No se pudo cargar el video')), {
        once: true,
      })
    })

    // Un fotograma al inicio (el 0 suele ser negro).
    const target =
      Number.isFinite(video.duration) && video.duration > 0
        ? Math.min(0.5, video.duration / 2)
        : 0.1
    const seeked = new Promise<void>((resolve) => {
      video.addEventListener('seeked', () => resolve(), { once: true })
      window.setTimeout(resolve, 900)
    })
    try {
      video.currentTime = target
    } catch {
      // sin seek disponible: se usa el fotograma actual
    }
    await seeked

    const size = 48
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (context === null) {
      return null
    }

    context.drawImage(video, 0, 0, size, size)
    const data = context.getImageData(0, 0, size, size).data
    const palette = derivePalette(extractClusters(data))
    cache.set(key, palette)
    return palette
  } catch {
    return null
  }
}

export function isLikelyLight(palette: AlbumPalette): boolean {
  return isLight(palette.dominant)
}
