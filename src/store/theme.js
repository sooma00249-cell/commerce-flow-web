import { create } from 'zustand'

export const THEME_STORAGE_KEY = 'cf-theme'
export const THEMES = ['light', 'dark', 'system']

/** Browser-chrome tint per resolved theme (status bar on mobile). */
const THEME_COLOR = { light: '#ffffff', dark: '#0a0a0a' }

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** Whether a preference resolves to dark right now (handles 'system'). */
export function resolveIsDark(theme) {
  return theme === 'dark' || (theme === 'system' && systemPrefersDark())
}

/**
 * Apply the resolved theme to <html>. Must stay in sync with the inline
 * no-FOUC script in index.html (class + colorScheme + data-theme + theme-color).
 */
export function applyTheme(theme) {
  const isDark = resolveIsDark(theme)
  const root = document.documentElement

  root.classList.toggle('dark', isDark)
  root.style.colorScheme = isDark ? 'dark' : 'light'
  root.setAttribute('data-theme', theme)

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', isDark ? THEME_COLOR.dark : THEME_COLOR.light)

  return isDark
}

function readStoredTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return THEMES.includes(stored) ? stored : 'system'
}

/**
 * The store holds only the *chosen preference* ('light' | 'dark' | 'system').
 * Writing to the DOM is owned by ThemeProvider's effect — a single applier —
 * so user clicks, live OS changes and cross-tab sync all flow through one path.
 * `setTheme` therefore only persists + updates state.
 */
export const useThemeStore = create((set) => ({
  theme: readStoredTheme(),
  setTheme: (theme) => {
    if (!THEMES.includes(theme)) return
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    set({ theme })
  },
}))
