import { create } from 'zustand'

export const THEME_STORAGE_KEY = 'cf-theme'
export const THEMES = ['light', 'dark', 'system']

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolveIsDark(theme) {
  return theme === 'dark' || (theme === 'system' && systemPrefersDark())
}

/** Apply the resolved theme to <html> (must match the inline no-FOUC script). */
export function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', resolveIsDark(theme))
}

function readStoredTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return THEMES.includes(stored) ? stored : 'system'
}

export const useThemeStore = create((set) => ({
  theme: readStoredTheme(),
  setTheme: (theme) => {
    if (!THEMES.includes(theme)) return
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    applyTheme(theme)
    set({ theme })
  },
}))
