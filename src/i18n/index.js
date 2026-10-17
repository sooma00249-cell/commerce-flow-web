import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import ar from './locales/ar.json'

export const SUPPORTED_LANGUAGES = ['en', 'ar']
export const RTL_LANGUAGES = ['ar']

export const LANG_STORAGE_KEY = 'cf-lang'

export function isRTL(lang) {
  return RTL_LANGUAGES.includes(lang)
}

/** Reflect the active language on <html> (lang + dir) for CSS/a11y/SEO. */
export function applyDocumentLanguage(lang) {
  const root = document.documentElement
  root.setAttribute('lang', lang)
  root.setAttribute('dir', isRTL(lang) ? 'rtl' : 'ltr')
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

const initialLang = i18n.resolvedLanguage || i18n.language || 'en'
applyDocumentLanguage(initialLang)

i18n.on('languageChanged', (lang) => {
  applyDocumentLanguage(lang)
  document.documentElement.setAttribute('data-lang', lang)
})

export default i18n
