import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './locales/en'
import { es } from './locales/es'
import { pt } from './locales/pt'

export const LANGUAGES = ['es', 'en', 'pt'] as const
export type Language = (typeof LANGUAGES)[number]

const STORAGE_KEY = 'legato.language'

function readStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'en' || stored === 'pt' ? stored : 'es'
  } catch {
    return 'es'
  }
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    pt: { translation: pt },
  },
  lng: readStoredLanguage(),
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
})

if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language
}

export function setLanguage(language: Language): void {
  localStorage.setItem(STORAGE_KEY, language)
  void i18n.changeLanguage(language)

  if (typeof document !== 'undefined') {
    document.documentElement.lang = language
  }
}

export { i18n }
