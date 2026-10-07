import { useTranslation } from 'react-i18next'
import { setLanguage } from './i18n'
import type { Language } from './i18n'

const OPTIONS: Array<{ value: Language; label: string }> = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' },
]

export function LanguageSelector({
  compact = false,
  onDark = false,
}: {
  compact?: boolean
  /** Sobre fondo oscuro (barra superior): texto claro. Si no, tinta sobre claro. */
  onDark?: boolean
}) {
  const { i18n, t } = useTranslation()

  return (
    <select
      aria-label={t('language.label')}
      className={`cursor-pointer appearance-none border-2 px-2.5 py-1 text-xs font-bold transition-colors focus:border-accent focus:outline-none ${
        onDark
          ? 'border-bg/40 bg-transparent text-bg hover:border-bg/70'
          : 'border-rule/60 bg-bg text-ink hover:border-accent'
      }`}
      onChange={(event) => setLanguage(event.target.value as Language)}
      value={i18n.language}
    >
      {OPTIONS.map((option) => (
        <option className="bg-surface text-ink" key={option.value} value={option.value}>
          {compact ? option.value.toUpperCase() : option.label}
        </option>
      ))}
    </select>
  )
}
