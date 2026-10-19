import { useEffect } from 'react'
import { applyTheme, useThemeStore, THEME_STORAGE_KEY } from '@/store/theme'

/**
 * Keeps <html class="dark"> in sync with the stored theme.
 * - when the theme is "system", reacts to live OS light/dark changes
 * - reacts to changes made in other open tabs
 */
export function ThemeProvider({ children }) {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  useEffect(() => {
    applyTheme(theme)

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onSystemChange = () => {
      if (useThemeStore.getState().theme === 'system') applyTheme('system')
    }
    mql.addEventListener('change', onSystemChange)

    const onStorage = (event) => {
      if (event.key !== THEME_STORAGE_KEY) return
      const next = event.newValue
      if (['light', 'dark', 'system'].includes(next)) setTheme(next)
    }
    window.addEventListener('storage', onStorage)

    return () => {
      mql.removeEventListener('change', onSystemChange)
      window.removeEventListener('storage', onStorage)
    }
  }, [theme, setTheme])

  return children
}
