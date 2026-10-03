import { useEffect } from 'react'
import { usePlayerStore } from '../../player'
import { useSpotifyStore } from '../sources/spotify-store'
import { applyAlbumTheme, clearAlbumTheme, deriveTheme } from './album-theme'
import { extractPaletteFromUrl } from './palette'

export function useAlbumTheme(): void {
  const currentArtwork = usePlayerStore((state) => state.currentTrack?.artworkUrl ?? null)
  const spotifyArtwork = useSpotifyStore((state) => state.playback?.artworkUrl ?? null)
  const artworkUrl = spotifyArtwork ?? currentArtwork

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
