import { clampBpm } from '../../player'

const MIN_ESTIMATE_BPM = 60
const MAX_ESTIMATE_BPM = 200
const MAX_ANALYSIS_SECONDS = 90
const HOP_SECONDS = 0.01
const LOWPASS_HZ = 150
const MIN_ANALYSIS_SECONDS = 4

/** Filtro paso bajos RBJ (Butterworth, Q = 1/√2) sobre las primeras `length` muestras. */
function lowPass(
  samples: Float32Array,
  length: number,
  sampleRate: number,
  cutoffHz: number,
): Float32Array {
  const output = new Float32Array(length)
  const w0 = (2 * Math.PI * cutoffHz) / sampleRate
  const cos = Math.cos(w0)
  const alpha = Math.sin(w0) / Math.SQRT2
  const a0 = 1 + alpha
  const b0 = (1 - cos) / 2 / a0
  const b1 = (1 - cos) / a0
  const b2 = b0
  const a1 = (-2 * cos) / a0
  const a2 = (1 - alpha) / a0

  let x1 = 0
  let x2 = 0
  let y1 = 0
  let y2 = 0
  for (let index = 0; index < length; index++) {
    const x0 = samples[index] ?? 0
    const y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
    output[index] = y0
    x2 = x1
    x1 = x0
    y2 = y1
    y1 = y0
  }

  return output
}

/** Envolvente de ataques (flujo de energía rectificado y normalizado). */
function onsetEnvelope(filtered: Float32Array, sampleRate: number): Float32Array | null {
  const hop = Math.max(1, Math.floor(sampleRate * HOP_SECONDS))
  const frames = Math.floor(filtered.length / hop)
  if (frames < 100) {
    return null
  }

  const energy = new Float32Array(frames)
  for (let frame = 0; frame < frames; frame++) {
    let sum = 0
    const start = frame * hop
    for (let index = 0; index < hop; index++) {
      const value = filtered[start + index] ?? 0
      sum += value * value
    }
    energy[frame] = sum / hop
  }

  const flux = new Float32Array(frames)
  let max = 0
  for (let frame = 1; frame < frames; frame++) {
    const value = Math.max(0, (energy[frame] ?? 0) - (energy[frame - 1] ?? 0))
    flux[frame] = value
    if (value > max) {
      max = value
    }
  }

  if (max <= 1e-6) {
    return null
  }

  for (let frame = 0; frame < frames; frame++) {
    flux[frame] = (flux[frame] ?? 0) / max
  }

  return flux
}

/** Autocorrelación de la envolvente: devuelve el retardo (en frames) más probable. */
function bestLag(envelope: Float32Array): number | null {
  const hopRate = 1 / HOP_SECONDS
  const minLag = Math.max(1, Math.round((hopRate * 60) / MAX_ESTIMATE_BPM))
  const maxLag = Math.min(envelope.length - 2, Math.round((hopRate * 60) / MIN_ESTIMATE_BPM))
  if (maxLag <= minLag) {
    return null
  }

  const scoreFor = (lag: number): number => {
    let sum = 0
    const count = envelope.length - lag
    for (let index = 0; index < count; index++) {
      sum += (envelope[index] ?? 0) * (envelope[index + lag] ?? 0)
    }
    return count === 0 ? 0 : sum / count
  }

  const scores: number[] = []
  for (let lag = minLag - 1; lag <= maxLag + 1; lag++) {
    scores.push(scoreFor(lag))
  }

  let bestIndex = 1
  for (let index = 1; index < scores.length - 1; index++) {
    if ((scores[index] ?? 0) > (scores[bestIndex] ?? 0)) {
      bestIndex = index
    }
  }

  const bestScore = scores[bestIndex] ?? 0
  if (bestScore <= 1e-6) {
    return null
  }

  const y0 = scores[bestIndex - 1] ?? bestScore
  const y1 = bestScore
  const y2 = scores[bestIndex + 1] ?? bestScore
  const denominator = y0 - 2 * y1 + y2
  const delta = denominator === 0 ? 0 : (0.5 * (y0 - y2)) / denominator
  const lag = minLag - 1 + bestIndex + Math.min(0.5, Math.max(-0.5, delta))

  return Math.min(maxLag, Math.max(minLag, lag))
}

/**
 * Estima el BPM a partir de muestras mono: filtra la banda del bombo,
 * calcula la envolvente de ataques y busca el periodo dominante por
 * autocorrelación. Puro y sin Web Audio para poder testearlo.
 */
export function estimateBpmFromSamples(samples: Float32Array, sampleRate: number): number | null {
  if (sampleRate <= 0 || samples.length < sampleRate * MIN_ANALYSIS_SECONDS) {
    return null
  }

  const length = Math.min(samples.length, Math.floor(sampleRate * MAX_ANALYSIS_SECONDS))
  const filtered = lowPass(samples, length, sampleRate, LOWPASS_HZ)
  const envelope = onsetEnvelope(filtered, sampleRate)
  if (envelope === null) {
    return null
  }

  const lag = bestLag(envelope)
  if (lag === null) {
    return null
  }

  let bpm = 60 / (lag * HOP_SECONDS)
  if (bpm < 70 && bpm * 2 <= MAX_ESTIMATE_BPM) {
    bpm *= 2
  } else if (bpm > 180 && bpm / 2 >= MIN_ESTIMATE_BPM) {
    bpm /= 2
  }

  return clampBpm(Math.round(bpm))
}

/** Decodifica el blob y estima el BPM (solo navegador; null si no se puede). */
export async function detectBpmFromBlob(blob: Blob): Promise<number | null> {
  if (blob.size === 0 || typeof OfflineAudioContext === 'undefined') {
    return null
  }

  try {
    const context = new OfflineAudioContext(1, 1, 44100)
    const buffer = await context.decodeAudioData(await blob.arrayBuffer())
    const length = Math.min(buffer.length, Math.floor(buffer.sampleRate * MAX_ANALYSIS_SECONDS))
    const samples = new Float32Array(length)
    const channels = Math.max(1, buffer.numberOfChannels)

    for (let channelIndex = 0; channelIndex < channels; channelIndex++) {
      const data = buffer.getChannelData(channelIndex)
      for (let index = 0; index < length; index++) {
        samples[index] += (data[index] ?? 0) / channels
      }
    }

    return estimateBpmFromSamples(samples, buffer.sampleRate)
  } catch {
    return null
  }
}
