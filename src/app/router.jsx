import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { RequireAuth } from '@/components/common/RequireAuth'
import { navSections } from '@/config/nav'
import LoginPage from '@/features/auth/LoginPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import PlaceholderPage from '@/features/misc/PlaceholderPage'
import NotFoundPage from '@/features/misc/NotFoundPage'

// Sections that are wired in the navigation but not implemented yet render a
// placeholder so the shell is fully navigable during early phases.
const placeholderRoutes = navSections
  .flatMap((section) => section.items)
  .filter((item) => item.to !== '/')
  .map((item) => ({
    path: item.to.replace(/^\//, ''),
    element: <PlaceholderPage titleKey={`nav.${item.key}`} />,
  }))

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'profile', element: <PlaceholderPage titleKey="nav.profile" /> },
      ...placeholderRoutes,
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
