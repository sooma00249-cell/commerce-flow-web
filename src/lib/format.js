/*
  Locale-aware formatting helpers.

  Numbers/currency always use Western (Latin) digits via `numberingSystem:
  'latn'`, even in Arabic — this is the common best practice for data-dense
  dashboards, SKUs, prices and order ids, and keeps values unambiguous when
  scanned alongside Latin skus/emails. Dates and words are still localized by
  locale, and the Arabic locale supplies Arabic month names.
*/

function withLatn(locale) {
  return locale === 'ar' ? 'ar-u-nu-latn' : locale
}

export function formatNumber(value, locale = 'en', options = {}) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat(withLatn(locale), options).format(n)
}

export function formatCurrency(value, locale = 'en', currency = 'USD') {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat(withLatn(locale), {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatDate(value, locale = 'en', options = {}) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(withLatn(locale), {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    ...options,
  }).format(date)
}

export function formatDateTime(value, locale = 'en', options = {}) {
  return formatDate(value, locale, {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  })
}

export function formatRelativeTime(value, locale = 'en') {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat(withLatn(locale), { numeric: 'auto' })
  const divisions = [
    { amount: 60, unit: 'second' },
    { amount: 60, unit: 'minute' },
    { amount: 24, unit: 'hour' },
    { amount: 7, unit: 'day' },
    { amount: 4.34524, unit: 'week' },
    { amount: 12, unit: 'month' },
    { amount: Number.POSITIVE_INFINITY, unit: 'year' },
  ]
  let duration = diffSeconds
  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit)
    }
    duration /= division.amount
  }
  return '—'
}
