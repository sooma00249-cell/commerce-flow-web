import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EntityThumbnail } from '@/components/common/EntityThumbnail'
import { RowActionsMenu } from '@/components/common/RowActionsMenu'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatCurrency, formatDate, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils/cn'

const MAX_VISIBLE_SPECS = 3

/**
 * Builds the product table columns. Permission-sensitive columns (cost) and
 * row actions are omitted when the current user may not perform them.
 */
export function useProductColumns({
  locale,
  showCost,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
}) {
  const { t } = useTranslation()

  return useMemo(() => {
    const columns = [
      {
        id: 'title',
        accessorKey: 'title',
        header: t('products.columns.product'),
        enableSorting: true,
        meta: { primary: true },
        cell: ({ row }) => {
          const product = row.original
          return (
            <div className="flex items-center gap-3">
              <EntityThumbnail src={product.images?.[0]} />
              <div className="min-w-0 max-w-[360px]">
                <div className="truncate font-medium">{product.title}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {product.description || product.sku}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        id: 'sku',
        accessorKey: 'sku',
        header: t('products.columns.sku'),
        enableSorting: true,
        meta: { hideOnMobile: true },
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-muted-foreground">{getValue()}</span>
        ),
      },
      {
        id: 'category',
        accessorFn: (product) => product.category?.title ?? '',
        header: t('products.columns.category'),
        enableSorting: false,
        cell: ({ getValue }) => getValue() || <span className="text-muted-foreground">—</span>,
      },
      {
        id: 'specifications',
        accessorFn: (product) => Object.keys(product.specifications ?? {}).length,
        header: t('products.sections.specifications'),
        enableSorting: false,
        meta: { hideBelow: 'xl' },
        cell: ({ row }) => {
          const specs = Object.entries(row.original.specifications ?? {})
          if (specs.length === 0) {
            return <span className="text-muted-foreground">—</span>
          }
          const visible = specs.slice(0, MAX_VISIBLE_SPECS)
          const extra = specs.length - visible.length
          return (
            <div className="flex flex-wrap gap-1">
              {visible.map(([key, value]) => (
                <Badge key={key} variant="secondary" className="max-w-[220px] truncate">
                  {key}: {value}
                </Badge>
              ))}
              {extra > 0 ? <Badge variant="muted">+{extra}</Badge> : null}
            </div>
          )
        },
      },
    ]

    if (showCost) {
      columns.push({
        id: 'costPrice',
        accessorKey: 'costPrice',
        header: t('products.columns.cost'),
        enableSorting: false,
        meta: { align: 'end' },
        cell: ({ getValue }) => (
          <span className="tabular-nums text-muted-foreground">
            {formatCurrency(getValue(), locale)}
          </span>
        ),
      })
    }

    columns.push(
      {
        id: 'price',
        accessorKey: 'price',
        header: t('products.columns.price'),
        enableSorting: true,
        meta: { align: 'end' },
        cell: ({ getValue }) => <span className="tabular-nums">{formatCurrency(getValue(), locale)}</span>,
      },
      {
        id: 'stock',
        accessorKey: 'stock',
        header: t('products.columns.stock'),
        enableSorting: true,
        meta: { align: 'end' },
        cell: ({ row }) => {
          const { stock, lowStockThreshold } = row.original
          const out = stock === 0
          const low = !out && lowStockThreshold != null && stock <= lowStockThreshold
          return (
            <div className="flex items-center justify-end gap-2">
              <span className={cn('tabular-nums', out && 'font-medium text-destructive')}>
                {formatNumber(stock, locale)}
              </span>
              {out ? (
                <Badge variant="destructive">{t('products.outOfStock')}</Badge>
              ) : low ? (
                <Badge variant="warning">{t('products.lowStock')}</Badge>
              ) : null}
            </div>
          )
        },
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: t('products.columns.status'),
        enableSorting: false,
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
      },
      {
        id: 'reserved',
        accessorKey: 'reserved',
        header: t('products.columns.reserved'),
        enableSorting: false,
        meta: { align: 'end', hideBelow: 'xl' },
        cell: ({ getValue }) => (
          <span className="tabular-nums text-muted-foreground">
            {formatNumber(getValue() ?? 0, locale)}
          </span>
        ),
      },
      {
        id: 'updatedAt',
        accessorKey: 'updatedAt',
        header: t('common.updatedAt'),
        enableSorting: false,
        meta: { hideBelow: '2xl' },
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{formatDate(getValue(), locale)}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        meta: { actions: true, align: 'end' },
        cell: ({ row }) => (
          <RowActionsMenu
            items={[
              { label: t('common.view'), icon: Eye, onSelect: () => onView(row.original) },
              canEdit
                ? { label: t('common.edit'), icon: Pencil, onSelect: () => onEdit(row.original) }
                : null,
              canDelete
                ? {
                    label: t('common.delete'),
                    icon: Trash2,
                    destructive: true,
                    onSelect: () => onDelete(row.original),
                  }
                : null,
            ]}
          />
        ),
      },
    )

    return columns
  }, [t, locale, showCost, canEdit, canDelete, onView, onEdit, onDelete])
}
