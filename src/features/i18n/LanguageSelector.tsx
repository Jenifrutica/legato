import { useTranslation } from 'react-i18next'
import { setLanguage } from './i18n'
import type { Language } from './i18n'

const OPTIONS: Array<{ value: Language; label: string }> = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' },
]

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation()

  return (
    <select
      aria-label={t('language.label')}
      className="cursor-pointer appearance-none border-2 border-bg/40 bg-transparent px-2.5 py-1 text-xs font-semibold text-bg transition-colors hover:border-bg/70 focus:border-accent focus:outline-none"
      onChange={(event) => setLanguage(event.target.value as Language)}
      value={i18n.language}
    >
      {OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {compact ? option.value.toUpperCase() : option.label}
        </option>
      ))}
    </select>
  )
}
