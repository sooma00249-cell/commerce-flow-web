import { useAuthStore } from '@/store/auth'
import { NoAccess } from './NoAccess'

/**
 * Gate a subtree behind a permission (or any-of array). Unauthorized users get
 * a "no access" panel instead of a blank screen — the sidebar already hides the
 * link, this is the defence-in-depth for direct URLs / stale tabs.
 *
 *   <RequirePermission permission="users:read"><UsersPage /></RequirePermission>
 */
export function RequirePermission({ permission, children, fallback }) {
  const hasPermission = useAuthStore((s) => s.hasPermission)
  if (!hasPermission(permission)) return fallback ?? <NoAccess />
  return children
}
