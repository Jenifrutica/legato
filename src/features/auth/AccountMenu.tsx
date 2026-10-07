import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from './auth-context'

/** Menú de cuenta compacto (perfil + salir), pensado para móvil. */
export function AccountMenu() {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current !== null && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (user === null) {
    return null
  }

  const initial = user.name.trim().charAt(0).toUpperCase() || 'L'

  return (
    <div className="relative" ref={ref}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('account.menu')}
        className="grid size-9 place-items-center overflow-hidden border-2 border-rule/50 bg-accent text-sm font-bold text-on-accent transition-colors hover:border-accent"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {user.pictureUrl !== null ? (
          <img
            alt=""
            className="size-full object-cover"
            referrerPolicy="no-referrer"
            src={user.pictureUrl}
          />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div
          aria-label={t('account.menu')}
          className="absolute right-0 z-40 mt-1 w-56 border-2 border-rule bg-surface p-3 text-ink shadow-[4px_4px_0_var(--color-rule)]"
          role="menu"
        >
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-ink-muted">
            {user.email ?? t('account.localProfile')}
          </p>
          <button
            className="mt-3 w-full border-2 border-rule bg-accent px-3 py-2 font-mono text-[0.6875rem] font-semibold tracking-[0.1em] text-on-accent uppercase transition-transform hover:-translate-y-0.5"
            onClick={() => {
              setOpen(false)
              void signOut()
            }}
            role="menuitem"
            type="button"
          >
            {t('account.signOut')}
          </button>
        </div>
      )}
    </div>
  )
}
