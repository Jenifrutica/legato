import { useTranslation } from 'react-i18next'
import { useConsentStore } from './consent-store'

export function CookieConsent() {
  const { t } = useTranslation()
  const status = useConsentStore((state) => state.status)
  const preferencesOpen = useConsentStore((state) => state.preferencesOpen)
  const acceptAll = useConsentStore((state) => state.acceptAll)
  const acceptEssentialOnly = useConsentStore((state) => state.acceptEssentialOnly)
  const openPreferences = useConsentStore((state) => state.openPreferences)
  const closePreferences = useConsentStore((state) => state.closePreferences)

  if (status === 'decided' && !preferencesOpen) {
    return null
  }

  return (
    <>
      {status === 'pending' && (
        <div
          aria-label={t('cookies.title')}
          className="fixed inset-x-3 bottom-28 z-40 mx-auto max-w-3xl rounded-lg border border-border bg-surface p-4 shadow-soft lg:bottom-24"
          role="region"
        >
          <p className="text-sm text-ink">{t('cookies.message')}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <button
              className="rounded-full bg-primary-strong px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              onClick={acceptAll}
              type="button"
            >
              {t('cookies.accept')}
            </button>
            <button
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink-muted transition-colors hover:border-primary hover:text-primary-strong"
              onClick={acceptEssentialOnly}
              type="button"
            >
              {t('cookies.essentialOnly')}
            </button>
            <button
              className="text-sm font-medium text-primary-strong underline underline-offset-2"
              onClick={openPreferences}
              type="button"
            >
              {t('cookies.preferences')}
            </button>
            <a
              className="text-sm font-medium text-ink-muted underline underline-offset-2"
              href="#/legal/cookies"
            >
              {t('legal.links.cookies')}
            </a>
          </div>
        </div>
      )}

      {preferencesOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/20 p-4"
          onClick={closePreferences}
          role="presentation"
        >
          <div
            aria-label={t('cookies.dialogTitle')}
            aria-modal="true"
            className="w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-soft"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <h2 className="font-display text-lg font-semibold">{t('cookies.dialogTitle')}</h2>

            <div className="mt-4 flex flex-col gap-4 text-sm">
              <div>
                <label className="flex items-center justify-between gap-3">
                  <span className="font-medium">{t('cookies.essentialTitle')}</span>
                  <input checked disabled type="checkbox" className="size-5 accent-primary" />
                </label>
                <p className="mt-1 text-xs text-ink-muted">{t('cookies.essentialText')}</p>
              </div>

              <div>
                <label className="flex items-center justify-between gap-3">
                  <span className="font-medium">{t('cookies.optionalTitle')}</span>
                  <input
                    checked={false}
                    disabled
                    type="checkbox"
                    className="size-5 accent-primary"
                  />
                </label>
                <p className="mt-1 text-xs text-ink-muted">{t('cookies.optionalText')}</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink-muted transition-colors hover:border-primary hover:text-primary-strong"
                onClick={closePreferences}
                type="button"
              >
                {t('cookies.close')}
              </button>
              <button
                className="rounded-full bg-primary-strong px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                onClick={acceptEssentialOnly}
                type="button"
              >
                {t('cookies.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
