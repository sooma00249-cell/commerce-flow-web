import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { LogOut, Menu, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { LanguageToggle } from '@/components/i18n/LanguageToggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Logo } from '@/components/common/Logo'
import { authApi } from '@/lib/api/endpoints'
import { useAuthStore } from '@/store/auth'

function initials(user) {
  if (!user) return '?'
  return `${user.firstname?.[0] ?? ''}${user.lastname?.[0] ?? ''}`.toUpperCase() || '?'
}

export function Topbar({ onOpenNav }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const clear = useAuthStore((s) => s.clear)

  async function handleSignOut() {
    try {
      await authApi.logout()
    } catch {
      /* ignore — clear locally regardless */
    }
    clear()
    toast.success(t('auth.loggedOut'))
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenNav}
        aria-label={t('nav.dashboard')}
      >
        <Menu />
      </Button>

      <div className="lg:hidden">
        <Logo showText={false} />
      </div>

      <div className="ms-auto flex items-center gap-0.5 sm:gap-1">
        <LanguageToggle />
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label={user?.email}>
              <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {initials(user)}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56">
            {user ? (
              <>
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span>{`${user.firstname} ${user.lastname}`}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            ) : null}
            <DropdownMenuItem onSelect={() => navigate('/profile')}>
              <UserIcon />
              <span>{t('nav.profile')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut />
              <span>{t('auth.signOut')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
