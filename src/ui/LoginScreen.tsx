import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthError, PASSWORD_MIN_LENGTH, useAuth } from '../features/auth'
import { LanguageSelector } from '../features/i18n'
import { LegatoLogo, LeguiBubble } from './Legui'

type Mode = 'signin' | 'signup' | 'reset'

const ERROR_KEYS = {
  'invalid-credentials': 'auth.errorInvalidCredentials',
  'invalid-email': 'auth.errorInvalidEmail',
  'email-in-use': 'auth.errorEmailInUse',
  'weak-password': 'auth.errorWeakPassword',
  'user-not-found': 'auth.errorUserNotFound',
  'email-not-verified': 'auth.errorEmailNotVerified',
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

export function LoginScreen({ embedded = false }: { embedded?: boolean } = {}) {
  const { t } = useTranslation()
  const {
    kind,
    supportsPasswordReset,
    supportsGoogle,
    signUp,
    signIn,
    signInWithGoogle,
    signInAsGuest,
    resetPassword,
  } = useAuth()
  // v1 local: correo/contraseña (IndexedDB) o invitado.
  const emailEnabled = kind === 'local'
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
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
        const result = await signUp({ email, password, name })
        if (result.needsEmailVerification) {
          setPassword('')
          setNotice(t('auth.pendingNotice', { email: email.trim() }))
        }
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

  const card = (
    <div className="border-2 border-rule bg-surface p-5 shadow-[6px_6px_0_var(--color-rule)]">
      {emailEnabled && (
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
      )}

      {supportsGoogle && mode !== 'reset' && signInWithGoogle !== undefined && (
        <div className="mt-4">
          <button
            className="w-full border-2 border-rule bg-accent px-4 py-2.5 font-mono text-xs font-semibold tracking-[0.1em] text-on-accent uppercase transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
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
          <p className="mt-1 text-[0.6875rem] leading-relaxed text-ink-muted">
            {t('auth.googleHint')}
          </p>
        </div>
      )}

      {supportsGoogle && signInWithGoogle !== undefined && emailEnabled && (
        <p className="mt-3 border-t-2 border-rule/20 pt-3 text-center font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase">
          {t('auth.orEmail')}
        </p>
      )}

      {!emailEnabled && (error !== null || notice !== null) && (
        <p
          className={`mt-3 text-xs ${error !== null ? 'text-danger' : 'text-ink'}`}
          role={error !== null ? 'alert' : 'status'}
        >
          {error ?? notice}
        </p>
      )}

      {emailEnabled && (
        <form
          autoComplete="off"
          className="mt-4 flex flex-col gap-3"
          onSubmit={(event) => void submit(event)}
        >
          {mode === 'signup' && (
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
              {t('auth.name')}
              <input
                autoComplete="name"
                autoCorrect="off"
                className="border-2 border-rule bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                onChange={(event) => setName(event.target.value)}
                spellCheck={false}
                type="text"
                value={name}
              />
            </label>
          )}

          <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
            {t('auth.email')}
            <input
              autoComplete="off"
              autoCorrect="off"
              className="border-2 border-rule bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              spellCheck={false}
              type="text"
              value={email}
            />
          </label>

          {mode !== 'reset' && (
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
              {t('auth.password')}
              <input
                autoComplete="off"
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
      )}

      <div
        className={`border-t-2 border-rule/20 pt-4 ${supportsGoogle || emailEnabled ? 'mt-4' : ''}`}
      >
        <button
          className="w-full border-2 border-rule bg-surface px-4 py-2.5 font-mono text-xs font-semibold tracking-[0.1em] text-ink uppercase transition-colors hover:border-accent"
          onClick={signInAsGuest}
          type="button"
        >
          {t('auth.guest')}
        </button>
        <p className="mt-1 text-[0.6875rem] leading-relaxed text-ink-muted">
          {t('auth.guestHint')}
        </p>
      </div>

      <p className="mt-4 text-[0.6875rem] leading-relaxed text-ink-muted">{t('auth.privacy')}</p>
    </div>
  )

  if (embedded) {
    return card
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-4 py-10 text-ink">
      <div className="w-full max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <span className="flex items-center">
            <LegatoLogo className="h-8 w-auto" />
            <span className="sr-only">Legato</span>
          </span>
          <LanguageSelector compact />
        </div>

        <div className="mb-4 border-2 border-rule bg-surface p-4 shadow-[4px_4px_0_var(--color-rule)]">
          <LeguiBubble size="size-14">
            <p className="font-display text-sm font-black tracking-[0.06em] uppercase">
              {t('legui.greetingTitle')}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">{t('legui.greetingText')}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              {t('legui.greetingInvite')}
            </p>
          </LeguiBubble>
        </div>

        {card}
      </div>
    </div>
  )
}

export function VerifyEmailScreen({ onContinue }: { onContinue?: () => void }) {
  const { t } = useTranslation()
  const { user, resendVerificationEmail, refreshUser, signOut, supportsGoogle, signInWithGoogle } =
    useAuth()
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

        <p className="mt-3 text-xs leading-relaxed text-ink-muted">{t('auth.verifyHint')}</p>

        {onContinue !== undefined && (
          <button
            className="mt-3 w-full border-2 border-rule bg-accent px-3 py-2.5 font-mono text-[0.6875rem] tracking-[0.1em] text-on-accent uppercase transition-transform hover:-translate-y-0.5"
            onClick={onContinue}
            type="button"
          >
            {t('auth.continueUnverified')}
          </button>
        )}

        {supportsGoogle && signInWithGoogle !== undefined && (
          <button
            className="mt-3 w-full border-2 border-rule bg-surface px-3 py-2 font-mono text-[0.6875rem] tracking-[0.1em] text-ink uppercase transition-colors hover:border-accent disabled:opacity-60"
            disabled={busy}
            onClick={() => {
              setBusy(true)
              void signOut()
                .then(() => signInWithGoogle())
                .catch((caught: unknown) => setError(t(errorKey(caught))))
                .finally(() => setBusy(false))
            }}
            type="button"
          >
            {t('auth.verifyGoogle')}
          </button>
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
