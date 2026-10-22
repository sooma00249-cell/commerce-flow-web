import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { AppDirectionProvider } from '@/components/i18n/DirectionProvider'
import { AuthProvider } from './AuthProvider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppDirectionProvider>
          <AuthProvider>{children}</AuthProvider>
        </AppDirectionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
