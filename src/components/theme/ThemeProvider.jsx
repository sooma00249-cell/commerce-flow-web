import { useEffect } from 'react'
import { applyTheme, useThemeStore } from '@/store/theme'

/**
 * Keeps <html class="dark"> in sync with the stored theme.
 * When the theme is "system", reacts to OS light/dark changes live.
 */
export function ThemeProvider({ children }) {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    applyTheme(theme)
    if (theme !== 'system') return undefined

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [theme])

  return children
}
