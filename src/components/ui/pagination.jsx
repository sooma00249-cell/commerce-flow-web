import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from './button'

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

/**
 * Table footer: row count + page size + prev/next.
 * Uses logical direction throughout, with chevrons mirrored in RTL.
 */
export function DataTablePagination({
  pageIndex,
  pageSize,
  pageCount,
  rowCount,
  total,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  className,
}) {
  const { t } = useTranslation()
  const safePageCount = Math.max(pageCount ?? 1, 1)

  const start = rowCount === 0 ? 0 : pageIndex * pageSize + 1
  const end = Math.min((pageIndex + 1) * pageSize, total ?? rowCount)

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span aria-live="polite">
          {total !== undefined && total !== null
            ? t('table.range', { start, end, total })
            : t('common.showing', { count: rowCount, total: rowCount })}
        </span>

        <label className="flex items-center gap-2">
          <span className="whitespace-nowrap">{t('table.rowsPerPage')}</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
            className="h-8 rounded-md border border-input bg-transparent px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {t('common.page', { page: pageIndex + 1, total: safePageCount })}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevious}
            disabled={!canPrevious}
            aria-label={t('table.previousPage')}
          >
            <ChevronLeft className="rtl:-scale-x-100" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onNext}
            disabled={!canNext}
            aria-label={t('table.nextPage')}
          >
            <ChevronRight className="rtl:-scale-x-100" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  )
}
