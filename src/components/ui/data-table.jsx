import { useState } from 'react'
import {
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  flexRender,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp, ArrowUpDown, Search, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from './button'
import { Input } from './input'
import { DataTablePagination } from './pagination'
import { Spinner } from './spinner'

/**
 * Static table configuration. Features + row-model factories are built once at
 * module scope because they never change between renders.
 *
 * Client-side sorting, global filtering and pagination are all enabled; pass
 * `manual` to hand those jobs to the server instead.
 */
const tableFeatureSet = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { ...sortFns },
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { ...filterFns },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  columnVisibilityFeature,
})

const DEFAULT_PAGE_SIZE = 20

function SortHeader({ header }) {
  const canSort = header.column.getCanSort()
  const sorted = header.column.getIsSorted()
  const label = flexRender(header.column.columnDef.header, header.getContext())

  if (!canSort) return <span>{label}</span>

  const Icon = sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : ArrowUpDown
  return (
    <button
      type="button"
      onClick={header.column.getToggleSortingHandler()}
      className="group -mx-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span>{label}</span>
      <Icon
        className={cn('size-3.5 shrink-0', sorted ? 'opacity-100' : 'opacity-40 group-hover:opacity-100')}
        aria-hidden="true"
      />
      <span className="sr-only">
        {sorted === 'asc'
          ? 'sorted ascending'
          : sorted === 'desc'
            ? 'sorted descending'
            : 'not sorted, activate to sort'}
      </span>
    </button>
  )
}

function SkeletonRows({ columns }) {
  return Array.from({ length: 5 }).map((_, rowIndex) => (
    <tr key={rowIndex} className="border-b">
      {columns.map((column, colIndex) => (
        <td key={column.id || column.accessorKey || colIndex} className="px-3 py-3">
          <div className="h-4 animate-pulse rounded bg-muted" style={{ width: colIndex === 0 ? '60%' : '40%' }} />
        </td>
      ))}
    </tr>
  ))
}

function StatusPanel({ variant = 'empty', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      {variant === 'empty' ? (
        <SearchX className="size-8 text-muted-foreground/60" aria-hidden="true" />
      ) : (
        <Spinner className="size-6 text-muted-foreground" />
      )}
      <p className="text-sm text-muted-foreground">{message}</p>
      {action}
    </div>
  )
}

/**
 * Reusable list table.
 *
 * Columns may carry `meta` for the mobile card layout:
 *   `meta: { primary: true }`   → card title
 *   `meta: { subtitle: true }`  → card subtitle
 *   `meta: { hideOnMobile: true }` → omitted from the card layout
 *
 * Pagination/sorting are controlled when you pass both the value and the change
 * handler (required for server-side data via `manual`); otherwise internal
 * state is used.
 */
export function DataTable({
  columns,
  data = [],
  isLoading = false,
  isFetching = false,
  error = null,
  onRetry,
  search,
  toolbar,
  sorting,
  onSortingChange,
  pagination,
  onPaginationChange,
  manual = false,
  total,
  getRowId,
  onRowClick,
  emptyMessage,
  loadingMessage,
  errorMessage,
  className,
  caption,
}) {
  const { t } = useTranslation()

  const [internalSorting, setInternalSorting] = useState([])
  const [internalPagination, setInternalPagination] = useState({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })

  const sortingControlled = sorting !== undefined && typeof onSortingChange === 'function'
  const paginationControlled = pagination !== undefined && typeof onPaginationChange === 'function'

  const activeSorting = sortingControlled ? sorting : internalSorting
  const activePagination = paginationControlled ? pagination : internalPagination

  function handleSortingChange(updater) {
    const next = typeof updater === 'function' ? updater(activeSorting) : updater
    if (sortingControlled) onSortingChange(next)
    else setInternalSorting(next)
  }

  function handlePaginationChange(updater) {
    const next = typeof updater === 'function' ? updater(activePagination) : updater
    if (paginationControlled) onPaginationChange(next)
    else setInternalPagination(next)
  }

  const table = useTable({
    features: tableFeatureSet,
    columns,
    data,
    ...(getRowId ? { getRowId } : {}),
    state: {
      sorting: activeSorting,
      globalFilter: search?.value ?? '',
      pagination: activePagination,
    },
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    manualSorting: manual,
    manualFiltering: manual,
    manualPagination: manual,
  })

  const headerGroups = table.getHeaderGroups()
  const rows = table.getRowModel().rows
  const leafColumns = table.getAllLeafColumns()
  const visibleColumns = leafColumns.filter((column) => column.getIsVisible())

  // Typing a new search must not leave you stranded on page 5 of the old
  // results — reset the page in the same event as the search change.
  const searchValue = search?.value ?? ''
  function handleSearchChange(value) {
    search?.onChange(value)
    if (activePagination.pageIndex !== 0) {
      handlePaginationChange({ ...activePagination, pageIndex: 0 })
    }
  }

  const pageCount = manual
    ? Math.max(1, Math.ceil((total ?? 0) / (activePagination.pageSize || DEFAULT_PAGE_SIZE)))
    : table.getPageCount()

  const displayTotal = manual ? (total ?? data.length) : table.getFilteredRowModel().rows.length

  const showToolbar = Boolean(search || toolbar)
  const showSkeleton = isLoading && rows.length === 0
  const showEmpty = !isLoading && !error && rows.length === 0

  return (
    <div className={cn('overflow-hidden rounded-lg border bg-card', className)}>
      {showToolbar ? (
        <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
          {search ? (
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={search.value}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder={search.placeholder || t('common.search')}
                aria-label={search.placeholder || t('common.search')}
                className="ps-9"
              />
            </div>
          ) : (
            <div />
          )}
          {toolbar ? <div className="flex flex-wrap items-center gap-2">{toolbar}</div> : null}
        </div>
      ) : null}

      {/* Desktop / tablet */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full caption-bottom text-sm">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead className="border-b bg-muted/40">
            {headerGroups.map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const column = header.column.columnDef
                  const align = column.meta?.align || 'start'
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={
                        header.column.getIsSorted() === 'asc'
                          ? 'ascending'
                          : header.column.getIsSorted() === 'desc'
                            ? 'descending'
                            : header.column.getCanSort()
                              ? 'none'
                              : undefined
                      }
                      className={cn(
                        'whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground',
                        align === 'end' ? 'text-end' : 'text-start',
                      )}
                    >
                      {header.isPlaceholder ? null : <SortHeader header={header} />}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {showSkeleton ? (
              <SkeletonRows columns={visibleColumns} />
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(
                    'border-b transition-colors last:border-0 hover:bg-muted/40',
                    onRowClick && 'cursor-pointer',
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const column = cell.column.columnDef
                    const align = column.meta?.align || 'start'
                    return (
                      <td
                        key={cell.id}
                        className={cn('px-3 py-3 align-middle', align === 'end' ? 'text-end' : 'text-start')}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      {!showSkeleton && rows.length > 0 ? (
        <ul className="divide-y md:hidden">
          {rows.map((row) => {
            const cells = row.getVisibleCells()
            const primary = cells.find((cell) => cell.column.columnDef.meta?.primary) || cells[0]
            const subtitle = cells.find((cell) => cell.column.columnDef.meta?.subtitle)
            const rest = cells.filter(
              (cell) =>
                cell !== primary &&
                cell !== subtitle &&
                !cell.column.columnDef.meta?.hideOnMobile,
            )
            return (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  disabled={!onRowClick}
                  className="flex w-full flex-col gap-1.5 px-4 py-3 text-start outline-none focus-visible:bg-accent disabled:cursor-default"
                >
                  <span className="font-medium">
                    {flexRender(primary.column.columnDef.cell, primary.getContext())}
                  </span>
                  {subtitle ? (
                    <span className="text-sm text-muted-foreground">
                      {flexRender(subtitle.column.columnDef.cell, subtitle.getContext())}
                    </span>
                  ) : null}
                  {rest.length > 0 ? (
                    <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                      {rest.map((cell) => (
                        <div key={cell.id} className="contents">
                          <dt className="text-muted-foreground">
                            {flexRender(cell.column.columnDef.header, cell.getContext())}
                          </dt>
                          <dd className="text-end">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}

      {showSkeleton || rows.length > 0 ? (
        <div className={cn(isFetching && 'opacity-60 transition-opacity')}>
          <DataTablePagination
            pageIndex={activePagination.pageIndex}
            pageSize={activePagination.pageSize}
            pageCount={pageCount}
            rowCount={rows.length}
            total={displayTotal}
            canPrevious={manual ? activePagination.pageIndex > 0 : table.getCanPreviousPage()}
            canNext={
              manual
                ? activePagination.pageIndex < pageCount - 1
                : table.getCanNextPage()
            }
            onPrevious={() =>
              manual
                ? handlePaginationChange({ ...activePagination, pageIndex: activePagination.pageIndex - 1 })
                : table.previousPage()
            }
            onNext={() =>
              manual
                ? handlePaginationChange({ ...activePagination, pageIndex: activePagination.pageIndex + 1 })
                : table.nextPage()
            }
            onPageSizeChange={(size) =>
              handlePaginationChange({ pageIndex: 0, pageSize: size })
            }
          />
        </div>
      ) : null}

      {error ? (
        <StatusPanel
          variant="error"
          message={errorMessage || t('common.error')}
          action={
            onRetry ? (
              <Button variant="outline" size="sm" onClick={onRetry}>
                {t('common.retry')}
              </Button>
            ) : null
          }
        />
      ) : null}

      {showEmpty ? (
        <StatusPanel
          variant="empty"
          message={emptyMessage || t('common.empty')}
          action={
            searchValue ? (
              <Button variant="ghost" size="sm" onClick={() => handleSearchChange('')}>
                {t('table.clearSearch')}
              </Button>
            ) : null
          }
        />
      ) : null}

      {isLoading && rows.length > 0 ? (
        <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
          <Spinner />
          {loadingMessage || t('common.loading')}
        </div>
      ) : null}
    </div>
  )
}
