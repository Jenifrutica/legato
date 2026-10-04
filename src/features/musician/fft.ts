/**
 * FFT radix-2 iterativa (potencia de dos). Suficiente para el análisis de
 * croma del detector de acordes; sin dependencias.
 */
export function fftInPlace(re: Float32Array, im: Float32Array): void {
  const n = re.length
  if (n <= 1) {
    return
  }

  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; (j & bit) !== 0; bit >>= 1) {
      j ^= bit
    }
    j ^= bit
    if (i < j) {
      const tempRe = re[i] ?? 0
      re[i] = re[j] ?? 0
      re[j] = tempRe
      const tempIm = im[i] ?? 0
      im[i] = im[j] ?? 0
      im[j] = tempIm
    }
  }

  for (let length = 2; length <= n; length <<= 1) {
    const angle = (-2 * Math.PI) / length
    const stepRe = Math.cos(angle)
    const stepIm = Math.sin(angle)
    const half = length >> 1

    for (let start = 0; start < n; start += length) {
      let curRe = 1
      let curIm = 0
      for (let k = 0; k < half; k++) {
        const evenRe = re[start + k] ?? 0
        const evenIm = im[start + k] ?? 0
        const oddRe = re[start + k + half] ?? 0
        const oddIm = im[start + k + half] ?? 0
        const vRe = oddRe * curRe - oddIm * curIm
        const vIm = oddRe * curIm + oddIm * curRe

        re[start + k] = evenRe + vRe
        im[start + k] = evenIm + vIm
        re[start + k + half] = evenRe - vRe
        im[start + k + half] = evenIm - vIm

        const nextRe = curRe * stepRe - curIm * stepIm
        curIm = curRe * stepIm + curIm * stepRe
        curRe = nextRe
      }
    }
  }
}

/** Magnitudes espectrales (N/2) de una señal real con ventana Hann. */
export function fftMagnitudes(input: Float32Array): Float32Array {
  const n = input.length
  const re = new Float32Array(n)
  const im = new Float32Array(n)

  for (let index = 0; index < n; index++) {
    const window = 0.5 * (1 - Math.cos((2 * Math.PI * index) / (n - 1)))
    re[index] = (input[index] ?? 0) * window
  }

  fftInPlace(re, im)

  const half = n >> 1
  const magnitudes = new Float32Array(half)
  for (let index = 0; index < half; index++) {
    const real = re[index] ?? 0
    const imaginary = im[index] ?? 0
    magnitudes[index] = Math.hypot(real, imaginary)
  }
  return magnitudes
}
