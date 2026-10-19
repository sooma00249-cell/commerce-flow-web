import { useCallback } from 'react'
import { ApiError } from '@/lib/api/client'

/**
 * Push express-validator `details` from a thrown `ApiError` onto react-hook-form
 * fields so server-side errors land next to the offending input.
 *
 * Returns `true` when at least one field was mapped, so callers know the error
 * was handled and doesn't need a toast.
 */
export function applyApiErrors(err, setError, clearErrors) {
  if (!(err instanceof ApiError)) return false
  const entries = Object.entries(err.fieldErrors)
  if (entries.length === 0) return false

  clearErrors?.()
  for (const [field, message] of entries) {
    setError(field, { type: 'server', message })
  }
  return true
}

/** `const applyErrors = useApiFormErrors()` then `applyErrors(err)` in a catch. */
export function useApiFormErrors(setError, clearErrors) {
  return useCallback(
    (err) => applyApiErrors(err, setError, clearErrors),
    [setError, clearErrors],
  )
}
