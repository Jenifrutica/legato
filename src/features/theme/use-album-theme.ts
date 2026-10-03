import { useEffect } from 'react'
import { usePlayerStore } from '../../player'
import { applyAlbumTheme, clearAlbumTheme, deriveTheme } from './album-theme'
import { extractPaletteFromUrl } from './palette'

export function useAlbumTheme(): void {
  const artworkUrl = usePlayerStore((state) => state.currentTrack?.artworkUrl ?? null)

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
