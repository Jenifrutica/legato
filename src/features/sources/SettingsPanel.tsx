import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { XIcon } from '../../ui/icons'
import { readAuthEnv, useAuth } from '../auth'
import { usePlayLogStore } from '../capsule'
import { useMusicianStore } from '../musician'
import { deleteUserData, wipeLocalData } from '../persistence'
import { configureCloudSync, syncNow, useSyncStore } from '../sync'
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
  const { user, deleteAccount, signOut } = useAuth()
  const [resetOpen, setResetOpen] = useState(false)
  const [resetBusy, setResetBusy] = useState(false)
  const syncEnabled = useSyncStore((state) => state.enabled)
  const syncStatus = useSyncStore((state) => state.status)
  const syncNeedsSetup = useSyncStore((state) => state.needsSetup)
  const syncProgress = useSyncStore((state) => state.progress)
  const syncLastAt = useSyncStore((state) => state.lastSyncAt)
  const setSyncEnabled = useSyncStore((state) => state.setEnabled)
  const cloudConfigured = readAuthEnv().firebase !== undefined
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

  async function confirmReset() {
    setResetBusy(true)
    try {
      await signOut().catch(() => undefined)
      await wipeLocalData()
      window.location.reload()
    } catch {
      setResetBusy(false)
    }
  }

  async function testConnection() {
    setTestResult(t('settings.testing'))

    try {
      const profile = await getSpotifyProfile()
      if (profile !== null) {
        setSpotifyConnected(true)
      }
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
    if (!open) {
      return
    }

    let active = true
    // Al abrir, relee el estado real (los tokens viven por usuario y el
    // bootstrap puede haberlos migrado después del primer render).
    setSpotifyConnected(isSpotifyConnected())

    void handleSpotifyRedirect().then((changed) => {
      if (active && (changed || isSpotifyConnected())) {
        setSpotifyConnected(true)
      }
    })

    return () => {
      active = false
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
        className="h-full w-full max-w-sm overflow-y-auto border-l border-border bg-surface p-5 text-ink shadow-soft"
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

        <section aria-label={t('sync.title')} className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {t('sync.title')}
          </h3>

          <div className="mt-3 border border-border bg-bg/50 p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">{t('sync.enable')}</span>
              <input
                aria-label={t('sync.enable')}
                checked={syncEnabled && cloudConfigured}
                className="size-5 accent-primary disabled:opacity-40"
                disabled={!cloudConfigured}
                onChange={(event) => {
                  setSyncEnabled(event.target.checked)
                  configureCloudSync(event.target.checked ? (user?.id ?? null) : null)
                }}
                type="checkbox"
              />
            </div>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              {cloudConfigured ? t('sync.hint') : t('sync.notConfigured')}
            </p>

            {cloudConfigured && syncEnabled && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  className="border-2 border-rule/40 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase transition-colors hover:border-accent hover:text-ink disabled:opacity-60"
                  disabled={syncStatus === 'syncing'}
                  onClick={() => void syncNow({ downloadFiles: false })}
                  type="button"
                >
                  {syncStatus === 'syncing' ? t('sync.syncing') : t('sync.now')}
                </button>
                <span className="font-mono text-[0.6875rem] text-ink-muted">
                  {syncStatus === 'error'
                    ? t('sync.error')
                    : syncNeedsSetup
                      ? t('sync.needsSetup')
                      : syncProgress !== null
                        ? t('sync.progress', {
                            done: syncProgress.done,
                            total: syncProgress.total,
                          })
                        : syncLastAt === null
                          ? t('sync.never')
                          : t('sync.last', { time: new Date(syncLastAt).toLocaleTimeString() })}
                </span>
              </div>
            )}
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

        <section aria-label={t('reset.title')} className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {t('reset.title')}
          </h3>

          <div className="mt-3 border border-border bg-bg/50 p-3">
            <p className="text-xs leading-relaxed text-ink-muted">{t('reset.hint')}</p>

            {!resetOpen ? (
              <button
                className="mt-3 border-2 border-rule/40 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase transition-colors hover:border-danger hover:text-danger"
                onClick={() => setResetOpen(true)}
                type="button"
              >
                {t('reset.action')}
              </button>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="border-2 border-danger bg-surface px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-danger uppercase disabled:opacity-60"
                  disabled={resetBusy}
                  onClick={() => void confirmReset()}
                  type="button"
                >
                  {t('reset.confirm')}
                </button>
                <button
                  className="border-2 border-rule/40 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase"
                  onClick={() => setResetOpen(false)}
                  type="button"
                >
                  {t('reset.cancel')}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
