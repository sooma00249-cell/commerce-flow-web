import { toast } from 'sonner'
import { ApiError } from '@/lib/api/client'

/** Map an API/network error to a user-facing, translated message. */
export function errorMessage(err, t) {
  if (!err) return t('common.error')
  if (err.status === 401) return t('auth.sessionExpired')
  if (err.status === 403) return t('errors.forbidden')
  if (err.status === 404) return t('errors.notFound')
  if (err.status === 0) return t('errors.network')
  if (err.status >= 500) return t('errors.server')
  return err.message || t('common.error')
}

/** True when the error is a validation failure we can show inline on fields. */
export function isValidationError(err) {
  return err instanceof ApiError && Object.keys(err.fieldErrors).length > 0
}

export function toastError(err, t, fallback) {
  const message = fallback || errorMessage(err, t)
  toast.error(message)
}

export function toastSuccess(message) {
  toast.success(message)
}

export function toastInfo(message) {
  toast.info(message)
}
