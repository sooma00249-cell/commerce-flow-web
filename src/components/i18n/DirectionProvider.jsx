import { DirectionProvider } from '@radix-ui/react-direction'
import { useTranslation } from 'react-i18next'
import { isRTL } from '@/i18n'

/**
 * Radix reads the writing direction from its own context, never from
 * `<html dir>`. Without this provider every popup (dropdown menu, select,
 * popover, tooltip) is positioned and laid out as LTR, which detaches menus
 * from their trigger in Arabic.
 */
export function AppDirectionProvider({ children }) {
  const { i18n } = useTranslation()
  const lang = i18n.resolvedLanguage || i18n.language
  const dir = isRTL(lang) ? 'rtl' : 'ltr'

  return <DirectionProvider dir={dir}>{children}</DirectionProvider>
}
