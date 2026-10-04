export type DecodedAudio = {
  samples: Float32Array
  sampleRate: number
}

/** Decodifica un blob de audio a mono (primeros `maxSeconds`). Solo navegador. */
export async function decodeMono(blob: Blob, maxSeconds: number): Promise<DecodedAudio | null> {
  if (blob.size === 0 || typeof OfflineAudioContext === 'undefined') {
    return null
  }

  try {
    const context = new OfflineAudioContext(1, 1, 44100)
    const buffer = await context.decodeAudioData(await blob.arrayBuffer())
    const length = Math.min(buffer.length, Math.floor(buffer.sampleRate * maxSeconds))
    const samples = new Float32Array(length)
    const channels = Math.max(1, buffer.numberOfChannels)

    for (let channelIndex = 0; channelIndex < channels; channelIndex++) {
      const data = buffer.getChannelData(channelIndex)
      for (let index = 0; index < length; index++) {
        samples[index] += (data[index] ?? 0) / channels
      }
    }

    return { samples, sampleRate: buffer.sampleRate }
  } catch {
    return null
  }
}
