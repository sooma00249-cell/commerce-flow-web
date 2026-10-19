import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { AppProviders } from './providers'
import { router } from './router'
import { useThemeStore } from '@/store/theme'

export default function App() {
  const theme = useThemeStore((s) => s.theme)

  return (
    <AppProviders>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
      <Toaster richColors closeButton position="top-center" theme={theme} />
    </AppProviders>
  )
}
