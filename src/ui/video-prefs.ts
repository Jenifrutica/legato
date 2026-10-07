import { create } from 'zustand'

const KEY = 'legato.video.v1'

function readInitial(): boolean {
  try {
    return localStorage.getItem(KEY) !== '0'
  } catch {
    return true
  }
}

type VideoPrefs = {
  /** Para mp4: reproducir el video dentro del disco (en vez de solo la portada). */
  inDisc: boolean
  toggle: () => void
}

export const useVideoPrefs = create<VideoPrefs>((set, get) => ({
  inDisc: readInitial(),
  toggle: () => {
    const next = !get().inDisc
    try {
      localStorage.setItem(KEY, next ? '1' : '0')
    } catch {
      // sin almacenamiento: solo estado en memoria
    }
    set({ inDisc: next })
  },
}))
