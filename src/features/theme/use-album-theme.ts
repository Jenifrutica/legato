import { useEffect } from 'react'
import { usePlayerStore } from '../../player'
import { useSpotifyStore } from '../sources/spotify-store'
import { applyAlbumTheme, clearAlbumTheme, deriveTheme } from './album-theme'
import { extractPaletteFromUrl, extractPaletteFromVideo } from './palette'

export function useAlbumTheme(): void {
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const currentArtwork = currentTrack?.artworkUrl ?? null
  const currentVideo =
    currentTrack?.mediaType === 'video' && !currentTrack.sourceUrl.startsWith('spotify:')
      ? currentTrack.sourceUrl
      : null
  const spotifyArtwork = useSpotifyStore((state) => state.playback?.artworkUrl ?? null)
  const artworkUrl = spotifyArtwork ?? currentArtwork
  // Sin portada y con video: la tinta sale de un fotograma del propio video.
  const videoUrl = artworkUrl === null ? currentVideo : null

  useEffect(() => {
    if (videoUrl !== null) {
      let cancelled = false
      void extractPaletteFromVideo(videoUrl).then((palette) => {
        if (!cancelled && palette !== null) {
          applyAlbumTheme(deriveTheme(palette))
        }
      })
      return () => {
        cancelled = true
      }
    }

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
  }, [artworkUrl, videoUrl])
}
