/*
  Thin fetch wrapper around the IMS API.

  Responsibilities:
  - Prefix the configured API base and serialize query params.
  - Send the session cookie (`credentials: 'include'`).
  - Unwrap the `{ ok, data, meta }` / `{ ok, error }` envelope.
  - Throw a rich `ApiError` carrying `status`, `code` and validation `details`.
  - Notify listeners on 401 so the app can drop the session.
  - Support binary downloads (report exports).
*/

const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, { status = 0, code, details } = {}) {
    super(message || 'Request failed')
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  /** Map express-validator `details` to a `{ field: message }` object. */
  get fieldErrors() {
    if (!Array.isArray(this.details)) return {}
    return this.details.reduce((acc, item) => {
      if (item && item.field && !acc[item.field]) acc[item.field] = item.message
      return acc
    }, {})
  }
}

const unauthorizedListeners = new Set()

/** Register a callback fired whenever an API call returns 401. */
export function onUnauthorized(listener) {
  unauthorizedListeners.add(listener)
  return () => unauthorizedListeners.delete(listener)
}

/**
 * Resolve `path` against the API base. With `absolute: true` the path is used
 * as-is (for endpoints outside `/api`, e.g. `GET /health`).
 */
function buildUrl(path, query, absolute = false) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const full = /^https?:\/\//i.test(path)
    ? path
    : absolute
      ? normalized
      : `${API_BASE}${normalized}`
  const url = new URL(full, window.location.origin)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue
      url.searchParams.set(key, String(value))
    }
  }
  return url
}

async function readError(res) {
  let payload = null
  try {
    payload = await res.json()
  } catch {
    /* not JSON */
  }
  const error = payload?.error || {}
  return new ApiError(error.message || res.statusText || 'Request failed', {
    status: res.status,
    code: error.code,
    details: error.details,
  })
}

export async function apiRequest(
  path,
  { method = 'GET', query, body, headers, signal, absolute = false } = {},
) {
  const url = buildUrl(path, query, absolute)
  const init = {
    method,
    credentials: 'include',
    signal,
    headers: { Accept: 'application/json', ...headers },
  }

  if (body !== undefined) {
    if (body instanceof FormData) {
      init.body = body
    } else {
      init.headers['Content-Type'] = 'application/json'
      init.body = JSON.stringify(body)
    }
  }

  let res
  try {
    res = await fetch(url, init)
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    throw new ApiError('Network error', { status: 0, code: 'NETWORK_ERROR' })
  }

  if (res.status === 401) {
    for (const listener of unauthorizedListeners) listener()
  }

  if (!res.ok) throw await readError(res)

  const payload = await res.json().catch(() => null)
  if (payload && payload.ok === false) throw await readError(res)
  return payload
}

export function get(path, { query, ...rest } = {}) {
  return apiRequest(path, { ...rest, method: 'GET', query })
}

export function post(path, body, { query, ...rest } = {}) {
  return apiRequest(path, { ...rest, method: 'POST', query, body })
}

export function patch(path, body, { query, ...rest } = {}) {
  return apiRequest(path, { ...rest, method: 'PATCH', query, body })
}

export function del(path, { query, ...rest } = {}) {
  return apiRequest(path, { ...rest, method: 'DELETE', query })
}

function filenameFromDisposition(header, fallback) {
  if (!header) return fallback
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(header)
  return match ? decodeURIComponent(match[1]) : fallback
}

export function triggerDownload(blob, filename) {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

/** Download a binary endpoint (e.g. report `?format=xlsx|pdf`) as a file. */
export async function download(path, { query, filename, signal } = {}) {
  const url = buildUrl(path, query)
  let res
  try {
    res = await fetch(url, { credentials: 'include', signal })
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    throw new ApiError('Network error', { status: 0, code: 'NETWORK_ERROR' })
  }
  if (!res.ok) throw await readError(res)
  const blob = await res.blob()
  const name = filenameFromDisposition(res.headers.get('Content-Disposition'), filename || 'download')
  triggerDownload(blob, name)
  return name
}
