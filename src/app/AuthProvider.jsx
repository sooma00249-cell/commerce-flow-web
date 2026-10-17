import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api/endpoints'
import { onUnauthorized } from '@/lib/api/client'
import { useAuthStore } from '@/store/auth'

/**
 * Loads the current session once on boot and clears auth state whenever any
 * API call returns 401 (expired/invalidated session).
 */
export function AuthProvider({ children }) {
  const setUser = useAuthStore((s) => s.setUser)
  const clear = useAuthStore((s) => s.clear)
  const queryClient = useQueryClient()

  useEffect(() => {
    let active = true
    authApi
      .me()
      .then((res) => {
        if (active) setUser(res.data)
      })
      .catch(() => {
        if (active) clear()
      })
    return () => {
      active = false
    }
  }, [setUser, clear])

  useEffect(
    () =>
      onUnauthorized(() => {
        if (useAuthStore.getState().status === 'authenticated') {
          clear()
          queryClient.clear()
        }
      }),
    [clear, queryClient],
  )

  return children
}
