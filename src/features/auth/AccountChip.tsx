import { useTranslation } from 'react-i18next'
import { useAuth } from './auth-context'

export function AccountChip() {
  const { t } = useTranslation()
  const { user, signIn, signOut } = useAuth()

  if (user === null) {
    return (
      <button
        className="w-full rounded-full border border-border px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-primary hover:text-primary-strong"
        onClick={() => void signIn()}
        type="button"
      >
        {t('account.signIn')}
      </button>
    )
  }

  const initial = user.name.trim().charAt(0).toUpperCase() || 'L'

  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent"
      >
        {initial}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{user.name}</span>
        <span className="hidden truncate text-xs text-ink-muted sm:block">
          {user.email ?? t('account.localProfile')}
        </span>
      </span>
      <button
        className="rounded-full px-2 py-1 text-xs font-medium text-ink-muted transition-colors hover:text-primary-strong"
        onClick={() => void signOut()}
        type="button"
      >
        {t('account.signOut')}
      </button>
    </div>
  )
}
