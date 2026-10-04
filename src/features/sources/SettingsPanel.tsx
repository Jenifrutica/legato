import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { XIcon } from '../../ui/icons'
import { useAuth } from '../auth'
import { usePlayLogStore } from '../capsule'
import { useMusicianStore } from '../musician'
import { deleteUserData } from '../persistence'
import { isJamendoConfigured } from './jamendo'
import { useProvidersStore } from './providers-store'
import {
  connectSpotify,
  disconnectSpotify,
  getSpotifyProfile,
  handleSpotifyRedirect,
  isSpotifyConfigured,
  isSpotifyConnected,
} from './spotify'
import { useSpotifyStore } from './spotify-store'
import type { SourceId } from './types'

export function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const enabled = useProvidersStore((state) => state.enabled)
  const setEnabled = useProvidersStore((state) => state.setEnabled)
  const [spotifyConnected, setSpotifyConnected] = useState(isSpotifyConnected())
  const [testResult, setTestResult] = useState<string | null>(null)
  const musicianEnabled = useMusicianStore((state) => state.enabled)
  const setMusicianEnabled = useMusicianStore((state) => state.setEnabled)
  const { user, deleteAccount } = useAuth()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function confirmDeleteAccount() {
    if (user === null) {
      return
    }
    setDeleteBusy(true)
    setDeleteError(null)
    try {
      const userId = user.id
      await deleteAccount(deletePassword === '' ? undefined : deletePassword)
      await deleteUserData(userId)
      usePlayLogStore.getState().clear()
    } catch {
      setDeleteError(t('auth.errorUnknown'))
    } finally {
      setDeleteBusy(false)
      setDeletePassword('')
    }
  }

  async function testConnection() {
    setTestResult(t('settings.testing'))

    try {
      const profile = await getSpotifyProfile()
      setTestResult(
        profile === null
          ? t('settings.testError', { error: 'sin sesión' })
          : t('settings.testOk', { name: profile.name }),
      )
    } catch (error) {
      setTestResult(
        t('settings.testError', { error: error instanceof Error ? error.message : 'error' }),
      )
    }
  }

  useEffect(() => {
    if (open) {
      void handleSpotifyRedirect().then((changed) => {
        if (changed) {
          setSpotifyConnected(true)
        }
      })
    }
  }, [open])

  if (!open) {
    return null
  }

  const rows: Array<{ id: SourceId; label: string; configured: boolean; note: string }> = [
    {
      id: 'spotify',
      label: 'Spotify',
      configured: isSpotifyConfigured(),
      note: spotifyConnected
        ? t('sources.connected')
        : isSpotifyConfigured()
          ? t('sources.notConnected')
          : t('sources.missingCredentials'),
    },
    { id: 'audius', label: 'Audius', configured: true, note: t('sources.freeNoKey') },
    {
      id: 'jamendo',
      label: 'Jamendo',
      configured: isJamendoConfigured(),
      note: isJamendoConfigured() ? t('sources.freeNoKey') : t('sources.missingCredentials'),
    },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-ink/20"
      onClick={onClose}
      role="presentation"
    >
      <div
        aria-label={t('settings.title')}
        aria-modal="true"
        className="h-full w-full max-w-sm overflow-y-auto border-l border-border bg-surface p-5 shadow-soft"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">{t('settings.title')}</h2>
          <button
            aria-label={t('settings.close')}
            className=" p-2 text-ink-muted transition-colors hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <section aria-label={t('sources.title')} className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {t('sources.title')}
          </h3>

          <div className="mt-3 flex flex-col gap-3">
            {rows.map((row) => (
              <div className=" border border-border bg-bg/50 p-3" key={row.id}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{row.label}</span>
                  <input
                    aria-label={row.label}
                    checked={enabled[row.id]}
                    className="size-5 accent-primary disabled:opacity-40"
                    disabled={!row.configured}
                    onChange={(event) => setEnabled(row.id, event.target.checked)}
                    type="checkbox"
                  />
                </div>
                <p className="mt-1 text-xs text-ink-muted">{row.note}</p>

                {row.id === 'spotify' && row.configured && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      className=" border border-border px-3 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-accent hover:text-accent-ink"
                      onClick={() => {
                        if (spotifyConnected) {
                          useSpotifyStore.getState().disconnect()
                          disconnectSpotify()
                          setSpotifyConnected(false)
                        } else {
                          void connectSpotify()
                        }
                      }}
                      type="button"
                    >
                      {spotifyConnected ? t('sources.disconnect') : t('sources.connectSpotify')}
                    </button>
                    {spotifyConnected && (
                      <button
                        className=" border border-border px-3 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-accent hover:text-accent-ink"
                        onClick={() => void testConnection()}
                        type="button"
                      >
                        {t('settings.testConnection')}
                      </button>
                    )}
                  </div>
                )}

                {row.id === 'spotify' && testResult !== null && (
                  <p className="mt-2 text-xs text-ink-muted">{testResult}</p>
                )}
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-ink-muted">{t('sources.hint')}</p>
        </section>

        <section aria-label={t('settings.musicianMode')} className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {t('settings.musicianMode')}
          </h3>

          <div className="mt-3 flex items-center justify-between gap-3 border border-border bg-bg/50 p-3">
            <div className="min-w-0">
              <span className="text-sm font-medium">{t('settings.musicianMode')}</span>
              <p className="mt-1 text-xs text-ink-muted">{t('settings.musicianHint')}</p>
            </div>
            <input
              aria-label={t('settings.musicianMode')}
              checked={musicianEnabled}
              className="size-5 shrink-0 accent-primary"
              onChange={(event) => setMusicianEnabled(event.target.checked)}
              type="checkbox"
            />
          </div>
        </section>

        {user !== null && (
          <section aria-label={t('auth.account')} className="mt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {t('auth.account')}
            </h3>

            <div className="mt-3 border border-border bg-bg/50 p-3">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-ink-muted">{user.email}</p>

              {!deleteOpen ? (
                <button
                  className="mt-3 border-2 border-rule/40 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase transition-colors hover:border-danger hover:text-danger"
                  onClick={() => setDeleteOpen(true)}
                  type="button"
                >
                  {t('auth.deleteAccount')}
                </button>
              ) : (
                <div className="mt-3 flex flex-col gap-2">
                  <p className="text-xs leading-relaxed text-ink-muted">{t('auth.deleteHint')}</p>
                  <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
                    {t('auth.deletePassword')}
                    <input
                      autoComplete="current-password"
                      className="border-2 border-rule bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                      onChange={(event) => setDeletePassword(event.target.value)}
                      type="password"
                      value={deletePassword}
                    />
                  </label>
                  {deleteError !== null && (
                    <p className="text-xs text-danger" role="alert">
                      {deleteError}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="border-2 border-danger bg-surface px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-danger uppercase disabled:opacity-60"
                      disabled={deleteBusy}
                      onClick={() => void confirmDeleteAccount()}
                      type="button"
                    >
                      {t('auth.deleteConfirm')}
                    </button>
                    <button
                      className="border-2 border-rule/40 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase"
                      onClick={() => {
                        setDeleteOpen(false)
                        setDeletePassword('')
                        setDeleteError(null)
                      }}
                      type="button"
                    >
                      {t('auth.deleteCancel')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
