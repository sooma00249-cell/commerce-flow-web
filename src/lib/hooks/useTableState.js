import { useCallback, useMemo, useState } from 'react'
import { useDebouncedValue } from './useDebouncedValue'

const EMPTY_FILTERS = {}

/**
 * Owns the state a server-driven `DataTable` needs — search, sorting,
 * pagination and extra filters — and derives the query object for the list
 * endpoint from it.
 *
 * Wire the returns straight onto `<DataTable />` (`search`, `sorting`,
 * `pagination` and their handlers) and pass `params` to the data hook.
 */
export function useTableState({
  defaultSort = [],
  pageSize = 20,
  defaultFilters = EMPTY_FILTERS,
} = {}) {
  const [search, setSearch] = useState('')
  const query = useDebouncedValue(search, 300)
  const [sorting, setSorting] = useState(defaultSort)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize })
  const [filters, setFilters] = useState(defaultFilters)

  const resetPage = useCallback(() => {
    setPagination((current) => (current.pageIndex === 0 ? current : { ...current, pageIndex: 0 }))
  }, [])

  const handleSortingChange = useCallback(
    (updater) => {
      setSorting((current) => (typeof updater === 'function' ? updater(current) : updater))
      resetPage()
    },
    [resetPage],
  )

  const setFilter = useCallback(
    (key, value) => {
      setFilters((current) => ({ ...current, [key]: value }))
      resetPage()
    },
    [resetPage],
  )

  const params = useMemo(() => {
    const next = { page: pagination.pageIndex + 1, limit: pagination.pageSize }
    if (query) next.q = query

    const first = sorting[0]
    if (first) {
      next.sort = first.id
      next.order = first.desc ? 'desc' : 'asc'
    }

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null || value === '' || value === 'all') continue
      next[key] = value
    }
    return next
  }, [pagination, query, sorting, filters])

  return {
    search,
    onSearchChange: setSearch,
    sorting,
    onSortingChange: handleSortingChange,
    pagination,
    onPaginationChange: setPagination,
    filters,
    setFilter,
    resetPage,
    params,
  }
}
