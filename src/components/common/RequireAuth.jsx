import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { FullPageLoader } from '@/components/ui/spinner'

export function RequireAuth({ children }) {
  const status = useAuthStore((s) => s.status)
  const location = useLocation()

  if (status === 'loading') return <FullPageLoader />
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}
