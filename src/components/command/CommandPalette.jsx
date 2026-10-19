import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Languages, LogOut, Moon, Search, Sun, User as UserIcon } from 'lucide-react'
import { filterNavByPermissions, navSections } from '@/config/nav'
import { authApi } from '@/lib/api/endpoints'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import { cn } from '@/lib/utils/cn'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

export function CommandPalette({ open, onOpenChange }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const clear = useAuthStore((s) => s.clear)
  const setTheme = useThemeStore((s) => s.setTheme)

  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef(null)

  const handleSignOut = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      /* clear locally regardless */
    }
    clear()
    navigate('/login', { replace: true })
  }, [clear, navigate])

  function runAction(run) {
    onOpenChange(false)
    setQuery('')
    setActiveIndex(0)
    run()
  }

  function handleQueryChange(value) {
    setQuery(value)
    setActiveIndex(0)
  }

  function handleOpenChange(next) {
    onOpenChange(next)
    if (!next) {
      setQuery('')
      setActiveIndex(0)
    }
  }

  const items = useMemo(() => {
    const navItems = filterNavByPermissions(navSections, hasPermission).flatMap((section) =>
      section.items.map((item) => ({
        id: `nav-${item.key}`,
        group:
          section.key === 'overview'
            ? t('command.navigate')
            : t(`nav.${section.key}`, { defaultValue: section.key }),
        label: t(`nav.${item.key}`),
        icon: item.icon,
        run: () => navigate(item.to),
      })),
    )

    const isDark =
      typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

    const actions = [
      {
        id: 'action-profile',
        group: t('command.actions'),
        label: t('nav.profile'),
        icon: UserIcon,
        run: () => navigate('/profile'),
      },
      {
        id: 'action-theme',
        group: t('command.actions'),
        label: t('theme.toggle'),
        icon: isDark ? Sun : Moon,
        run: () => setTheme(isDark ? 'light' : 'dark'),
      },
      {
        id: 'action-language',
        group: t('command.actions'),
        label: t('language.toggle'),
        icon: Languages,
        run: () => i18n.changeLanguage(i18n.resolvedLanguage === 'ar' ? 'en' : 'ar'),
      },
      {
        id: 'action-signout',
        group: t('command.actions'),
        label: t('auth.signOut'),
        icon: LogOut,
        run: handleSignOut,
      },
    ]

    return [...navItems, ...actions]
  }, [hasPermission, navigate, setTheme, i18n, t, handleSignOut])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => item.label.toLowerCase().includes(q))
  }, [items, query])

  // Derived, not effect-driven: an out-of-range highlight just clamps.
  const safeActiveIndex = filtered.length === 0 ? 0 : Math.min(activeIndex, filtered.length - 1)

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    list.querySelector(`[data-index="${safeActiveIndex}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [safeActiveIndex])

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % filtered.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + filtered.length) % filtered.length)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(filtered.length - 1)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const item = filtered[safeActiveIndex]
      if (item) runAction(item.run)
    }
  }

  let lastGroup = null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="top-[15%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{t('command.title')}</DialogTitle>
        <DialogDescription className="sr-only">{t('command.description')}</DialogDescription>

        <div className="flex items-center gap-2 border-b px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('command.placeholder')}
            aria-label={t('command.placeholder')}
            aria-controls="command-listbox"
            aria-activedescendant={
              filtered[safeActiveIndex] ? `command-option-${filtered[safeActiveIndex].id}` : undefined
            }
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="pointer-events-none hidden select-none rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
            Esc
          </kbd>
        </div>

        <ul
          id="command-listbox"
          role="listbox"
          aria-label={t('command.title')}
          ref={listRef}
          className="max-h-[min(24rem,60vh)] overflow-y-auto p-1.5"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
              {t('command.noResults')}
            </li>
          ) : (
            filtered.map((item, index) => {
              const showGroup = item.group !== lastGroup
              lastGroup = item.group
              const Icon = item.icon
              return (
                <li key={item.id} role="none">
                  {showGroup ? (
                    <p className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {item.group}
                    </p>
                  ) : null}
                  <div
                    id={`command-option-${item.id}`}
                    role="option"
                    aria-selected={index === safeActiveIndex}
                    data-index={index}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => runAction(item.run)}
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-2 text-sm',
                      index === safeActiveIndex
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground',
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </div>
                </li>
              )
            })
          )}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
