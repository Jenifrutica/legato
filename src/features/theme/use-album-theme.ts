import { useEffect } from 'react'
import { useLibraryStore } from '../library'
import { usePlayerStore } from '../../player'
import { applyAlbumTheme, clearAlbumTheme, deriveTheme } from './album-theme'
import { extractPaletteFromUrl } from './palette'

export function useAlbumTheme(): void {
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const artworkUrl = useLibraryStore((state) =>
    currentTrack === null
      ? null
      : (state.tracks.find((track) => track.id === currentTrack.id)?.artworkUrl ?? null),
  )

  useEffect(() => {
    if (artworkUrl === null) {
      clearAlbumTheme()
      return
    }

    let cancelled = false
    void extractPaletteFromUrl(artworkUrl).then((palette) => {
      if (!cancelled && palette !== null) {
        applyAlbumTheme(deriveTheme(palette))
      }
    })

    return () => {
      cancelled = true
    }
  }, [artworkUrl])
}
