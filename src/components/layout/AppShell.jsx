import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { CommandPalette } from '@/components/command/CommandPalette'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { isCommandPaletteShortcut } from '@/lib/shortcuts'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const location = useLocation()

  // Global Ctrl/Cmd+K shortcut for the command palette.
  useEffect(() => {
    function onKeyDown(event) {
      if (isCommandPaletteShortcut(event)) {
        event.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="min-h-svh bg-background">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-3 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="lg:ps-64">
        <Topbar onOpenNav={() => setMobileNavOpen(true)} onOpenCommand={() => setCommandOpen(true)} />
        <main
          id="content"
          className="mx-auto w-full max-w-screen-2xl p-4 sm:p-6 lg:p-8 3xl:max-w-[110rem]"
        >
          <ErrorBoundary resetKeys={[location.pathname]}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  )
}
