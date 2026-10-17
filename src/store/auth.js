import { create } from 'zustand'

/**
 * Session/auth state.
 *
 * `status`:
 *   'loading'       — bootstrap request in flight
 *   'authenticated' — a user is signed in
 *   'anonymous'     — no session
 */
export const useAuthStore = create((set, get) => ({
  user: null,
  status: 'loading',

  setUser: (user) => set({ user: user || null, status: user ? 'authenticated' : 'anonymous' }),
  setStatus: (status) => set({ status }),
  clear: () => set({ user: null, status: 'anonymous' }),

  /** Check one permission or any of an array of permissions. */
  hasPermission: (permission) => {
    const { user } = get()
    if (!user) return false
    const list = Array.isArray(permission) ? permission : [permission]
    const granted = user.permissions || []
    return list.some((p) => granted.includes(p))
  },
}))
