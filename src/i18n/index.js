import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import ar from './locales/ar.json'

export const SUPPORTED_LANGUAGES = ['en', 'ar']
export const RTL_LANGUAGES = ['ar']

export const LANG_STORAGE_KEY = 'cf-lang'

/** Normalise 'ar-SA', 'en-GB' … to a supported base language. */
export function normalizeLanguage(value) {
  const candidate = String(value || '').toLowerCase()
  if (!candidate) return null
  if (SUPPORTED_LANGUAGES.includes(candidate)) return candidate
  const base = candidate.split('-')[0]
  return SUPPORTED_LANGUAGES.includes(base) ? base : null
}

export function isRTL(lang) {
  const base = String(lang || '').toLowerCase().split('-')[0]
  return RTL_LANGUAGES.includes(base)
}

/** Reflect the active language on <html> for CSS/a11y/SEO. No-op without a DOM. */
export function applyDocumentLanguage(lang) {
  const resolved = normalizeLanguage(lang) || 'en'
  if (typeof document === 'undefined') return resolved
  const root = document.documentElement
  root.setAttribute('lang', resolved)
  root.setAttribute('dir', isRTL(resolved) ? 'rtl' : 'ltr')
  root.setAttribute('data-lang', resolved)
  return resolved
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANG_STORAGE_KEY,
      caches: ['localStorage'],
    },
  })

// Reflect the resolved language on <html> immediately at boot.
applyDocumentLanguage(i18n.resolvedLanguage || i18n.language || 'en')

i18n.on('languageChanged', (lang) => {
  applyDocumentLanguage(lang)
})

// Keep other open tabs in sync when the language changes in one of them.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== LANG_STORAGE_KEY) return
    const next = normalizeLanguage(event.newValue)
    if (next && next !== (i18n.resolvedLanguage || i18n.language)) {
      i18n.changeLanguage(next)
    }
  })
}

export default i18n
