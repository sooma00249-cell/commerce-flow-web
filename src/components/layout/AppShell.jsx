import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

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
        <Topbar onOpenNav={() => setMobileNavOpen(true)} />
        <main
          id="content"
          className="mx-auto w-full max-w-screen-2xl p-4 sm:p-6 lg:p-8 3xl:max-w-[110rem]"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
