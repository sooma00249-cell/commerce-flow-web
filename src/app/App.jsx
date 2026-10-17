import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppProviders } from './providers'
import { router } from './router'
import { useThemeStore } from '@/store/theme'

export default function App() {
  const theme = useThemeStore((s) => s.theme)

  return (
    <AppProviders>
      <RouterProvider router={router} />
      <Toaster
        richColors
        closeButton
        position="top-center"
        theme={theme === 'system' ? 'system' : theme}
      />
    </AppProviders>
  )
}
