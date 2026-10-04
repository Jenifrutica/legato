import { useTranslation } from 'react-i18next'
import { useAuth } from './auth-context'

export function AccountChip() {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()

  if (user === null) {
    return null
  }

  const initial = user.name.trim().charAt(0).toUpperCase() || 'L'

  return (
    <div className="flex items-center gap-2">
      {user.pictureUrl !== null ? (
        <img
          alt=""
          className="size-8 shrink-0 border border-bg/40 object-cover"
          referrerPolicy="no-referrer"
          src={user.pictureUrl}
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center border border-bg/40 bg-accent text-sm font-bold text-on-accent"
        >
          {initial}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-bg">{user.name}</span>
        <span className="hidden truncate text-xs text-bg/60 sm:block">
          {user.email ?? t('account.localProfile')}
        </span>
      </span>
      <button
        className="shrink-0 px-1 py-1 text-xs font-medium text-bg/60 transition-colors hover:text-accent-ink"
        onClick={() => void signOut()}
        type="button"
      >
        {t('account.signOut')}
      </button>
    </div>
  )
}
