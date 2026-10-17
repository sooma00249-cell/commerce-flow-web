import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { filterNavByPermissions, navSections } from '@/config/nav'
import { useAuthStore } from '@/store/auth'
import { Logo } from '@/components/common/Logo'
import { Button } from '@/components/ui/button'

function NavItem({ item, onNavigate }) {
  const { t } = useTranslation()
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
        )
      }
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span>{t(`nav.${item.key}`)}</span>
    </NavLink>
  )
}

export function Sidebar({ mobileOpen, onClose }) {
  const { t } = useTranslation()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const sections = filterNavByPermissions(navSections, hasPermission)

  return (
    <>
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        aria-label={t('nav.dashboard')}
        className={cn(
          'fixed inset-y-0 start-0 z-50 w-64 flex-col border-e border-sidebar-border bg-sidebar text-sidebar-foreground',
          mobileOpen ? 'flex' : 'hidden lg:flex',
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          <Logo />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <X />
          </Button>
        </div>

        <nav className="no-scrollbar flex-1 space-y-6 overflow-y-auto p-3">
          {sections.map((section) => (
            <div key={section.key} className="space-y-1">
              {section.key !== 'overview' ? (
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t(`nav.${section.key}`, { defaultValue: section.key })}
                </p>
              ) : null}
              {section.items.map((item) => (
                <NavItem key={item.key} item={item} onNavigate={onClose} />
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
