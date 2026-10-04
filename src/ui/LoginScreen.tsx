import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthError, PASSWORD_MIN_LENGTH, useAuth } from '../features/auth'
import { LanguageSelector } from '../features/i18n'
import { DiscMark } from './icons'

type Mode = 'signin' | 'signup' | 'reset'

const ERROR_KEYS = {
  'invalid-credentials': 'auth.errorInvalidCredentials',
  'invalid-email': 'auth.errorInvalidEmail',
  'email-in-use': 'auth.errorEmailInUse',
  'weak-password': 'auth.errorWeakPassword',
  'user-not-found': 'auth.errorUserNotFound',
  'too-many-requests': 'auth.errorTooManyRequests',
  network: 'auth.errorNetwork',
  'not-supported': 'auth.errorNotSupported',
} as const

function errorKey(
  caught: unknown,
): (typeof ERROR_KEYS)[keyof typeof ERROR_KEYS] | 'auth.errorUnknown' {
  if (caught instanceof AuthError && caught.code in ERROR_KEYS) {
    return ERROR_KEYS[caught.code as keyof typeof ERROR_KEYS]
  }
  return 'auth.errorUnknown'
}

export function LoginScreen() {
  const { t } = useTranslation()
  const { supportsPasswordReset, supportsGoogle, signUp, signIn, signInWithGoogle, resetPassword } =
    useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy) {
      return
    }
    setBusy(true)
    setError(null)
    setNotice(null)

    try {
      if (mode === 'signup') {
        await signUp({ email, password, name: '' })
      } else if (mode === 'signin') {
        await signIn(email, password)
      } else {
        await resetPassword(email)
        setNotice(t('auth.resetSent'))
      }
    } catch (caught) {
      setError(t(errorKey(caught)))
    } finally {
      setBusy(false)
    }
  }

  const tabs: Array<{ id: Mode; label: string }> = [
    { id: 'signin', label: t('auth.signIn') },
    { id: 'signup', label: t('auth.signUp') },
    ...(supportsPasswordReset ? [{ id: 'reset' as Mode, label: t('auth.reset') }] : []),
  ]

  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-4 py-10 text-ink">
      <div className="w-full max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="grid size-9 place-items-center border-2 border-rule bg-accent text-on-accent">
              <DiscMark className="size-5" />
            </span>
            <b className="font-display text-xl font-black tracking-[0.08em] uppercase">Legato</b>
          </span>
          <LanguageSelector compact />
        </div>

        <div className="border-2 border-rule bg-surface p-5 shadow-[6px_6px_0_var(--color-rule)]">
          <div className="flex border-b-2 border-rule" role="tablist">
            {tabs.map((tab) => (
              <button
                aria-selected={mode === tab.id}
                className={`px-3 py-2 font-mono text-[0.6875rem] tracking-[0.1em] uppercase transition-colors ${
                  mode === tab.id ? 'bg-accent text-on-accent' : 'text-ink-muted hover:text-ink'
                }`}
                key={tab.id}
                onClick={() => {
                  setMode(tab.id)
                  setError(null)
                  setNotice(null)
                }}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form className="mt-4 flex flex-col gap-3" onSubmit={(event) => void submit(event)}>
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
              {t('auth.email')}
              <input
                autoComplete="email"
                className="border-2 border-rule bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>

            {mode !== 'reset' && (
              <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
                {t('auth.password')}
                <input
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  className="border-2 border-rule bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                  minLength={mode === 'signup' ? PASSWORD_MIN_LENGTH : undefined}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
                {mode === 'signup' && (
                  <span className="font-mono text-[0.6875rem] text-ink-muted">
                    {t('auth.passwordHint', { count: PASSWORD_MIN_LENGTH })}
                  </span>
                )}
              </label>
            )}

            {error !== null && (
              <p className="text-xs text-danger" role="alert">
                {error}
              </p>
            )}
            {notice !== null && (
              <p className="text-xs text-ink" role="status">
                {notice}
              </p>
            )}

            <button
              className="border-2 border-rule bg-accent px-4 py-2 font-mono text-xs font-semibold tracking-[0.12em] text-on-accent uppercase transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
              disabled={busy}
              type="submit"
            >
              {mode === 'signup'
                ? t('auth.submitSignUp')
                : mode === 'reset'
                  ? t('auth.submitReset')
                  : t('auth.submitSignIn')}
            </button>
          </form>

          {supportsGoogle && mode !== 'reset' && signInWithGoogle !== undefined && (
            <button
              className="mt-3 w-full border-2 border-rule bg-surface px-4 py-2 font-mono text-xs font-semibold tracking-[0.1em] text-ink uppercase transition-colors hover:border-accent"
              disabled={busy}
              onClick={() => {
                setBusy(true)
                setError(null)
                void signInWithGoogle()
                  .catch((caught: unknown) => setError(t(errorKey(caught))))
                  .finally(() => setBusy(false))
              }}
              type="button"
            >
              {t('auth.google')}
            </button>
          )}

          <p className="mt-4 text-[0.6875rem] leading-relaxed text-ink-muted">
            {t('auth.privacy')}
          </p>
        </div>
      </div>
    </div>
  )
}

export function VerifyEmailScreen() {
  const { t } = useTranslation()
  const { user, resendVerificationEmail, refreshUser, signOut } = useAuth()
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function resend() {
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      await resendVerificationEmail?.()
      setNotice(t('auth.resent'))
    } catch (caught) {
      setError(t(errorKey(caught)))
    } finally {
      setBusy(false)
    }
  }

  async function check() {
    setBusy(true)
    setError(null)
    try {
      await refreshUser?.()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-4 py-10 text-ink">
      <div className="w-full max-w-md border-2 border-rule bg-surface p-5 shadow-[6px_6px_0_var(--color-rule)]">
        <h1 className="font-display text-lg font-black tracking-[0.06em] uppercase">
          {t('auth.verifyTitle')}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {t('auth.verifyText', { email: user?.email ?? '' })}
        </p>

        {notice !== null && (
          <p className="mt-3 text-xs text-ink" role="status">
            {notice}
          </p>
        )}
        {error !== null && (
          <p className="mt-3 text-xs text-danger" role="alert">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="border-2 border-rule bg-accent px-3 py-2 font-mono text-[0.6875rem] tracking-[0.1em] text-on-accent uppercase disabled:opacity-60"
            disabled={busy}
            onClick={() => void check()}
            type="button"
          >
            {t('auth.verified')}
          </button>
          <button
            className="border-2 border-rule bg-surface px-3 py-2 font-mono text-[0.6875rem] tracking-[0.1em] text-ink uppercase disabled:opacity-60"
            disabled={busy}
            onClick={() => void resend()}
            type="button"
          >
            {t('auth.resend')}
          </button>
          <button
            className="border-2 border-rule/40 px-3 py-2 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase"
            onClick={() => void signOut()}
            type="button"
          >
            {t('auth.signOutAccount')}
          </button>
        </div>
      </div>
    </div>
  )
}
