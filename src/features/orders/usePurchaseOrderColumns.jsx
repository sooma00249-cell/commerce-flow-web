import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye } from 'lucide-react'
import { RowActionsMenu } from '@/components/common/RowActionsMenu'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatCurrency, formatDate, formatNumber } from '@/lib/format'
import { useAuthStore } from '@/store/auth'
import { orderReference } from './schema'

/**
 * Purchase-order table columns.
 *
 * Sortable columns map 1:1 onto the API's sort whitelist
 * (`createdAt`, `total`, `status`, `receivedAt`). The total is money the user
 * may not be allowed to see, so it is masked without `products:readCost`.
 */
export function usePurchaseOrderColumns({ locale, onView, getStatuses, onStatus }) {
  const { t } = useTranslation()
  const canReadCost = useAuthStore((s) => s.hasPermission('products:readCost'))

  return useMemo(() => {
    const columns = [
      {
        id: 'reference',
        header: t('orders.columns.order'),
        enableSorting: false,
        meta: { primary: true },
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium">#{orderReference(row.original._id)}</div>
            <div className="truncate text-xs text-muted-foreground">
              {row.original.supplier?.name}
            </div>
          </div>
        ),
      },
      {
        id: 'supplier',
        accessorFn: (order) => order.supplier?.name ?? '',
        header: t('orders.columns.supplier'),
        enableSorting: false,
        meta: { subtitle: true },
        cell: ({ row }) => {
          const supplier = row.original.supplier
          if (!supplier) return <span className="text-muted-foreground">—</span>
          return (
            <div className="min-w-0">
              <div className="truncate">{supplier.name}</div>
              <div className="truncate text-xs text-muted-foreground">{supplier.email}</div>
            </div>
          )
        },
      },
      {
        id: 'items',
        accessorFn: (order) => order.items?.length ?? 0,
        header: t('orders.columns.items'),
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="tabular-nums">{formatNumber(getValue(), locale)}</span>
        ),
      },
      {
        id: 'total',
        accessorKey: 'total',
        header: t('orders.columns.total'),
        enableSorting: true,
        meta: { align: 'end' },
        cell: ({ getValue }) => (
          <span className="tabular-nums">
            {canReadCost ? formatCurrency(getValue(), locale) : t('orders.costHidden')}
          </span>
        ),
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: t('orders.columns.status'),
        enableSorting: true,
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
      },
      {
        id: 'expectedDeliveryDate',
        accessorKey: 'expectedDeliveryDate',
        header: t('orders.columns.expectedDelivery'),
        enableSorting: false,
        meta: { hideOnMobile: true },
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{formatDate(getValue(), locale)}</span>
        ),
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: t('orders.columns.createdAt'),
        enableSorting: true,
        meta: { hideOnMobile: true },
        cell: ({ getValue }) => <span className="text-muted-foreground">{formatDate(getValue(), locale)}</span>,
      },
      {
        id: 'receivedAt',
        accessorKey: 'receivedAt',
        header: t('orders.columns.receivedAt'),
        enableSorting: false,
        meta: { hideBelow: 'xl' },
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">
            {getValue() ? formatDate(getValue(), locale) : '—'}
          </span>
        ),
      },
      {
        id: 'orderedAt',
        accessorKey: 'orderedAt',
        header: t('orders.columns.orderedAt'),
        enableSorting: false,
        meta: { hideBelow: '2xl' },
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">
            {getValue() ? formatDate(getValue(), locale) : '—'}
          </span>
        ),
      },
    ]

    columns.push({
      id: 'actions',
      header: '',
      enableSorting: false,
      meta: { actions: true, align: 'end' },
      cell: ({ row }) => {
        const order = row.original
        const statuses = getStatuses?.(order) ?? []
        return (
          <RowActionsMenu
            label={t('orders.actionsLabel')}
            items={[
              { label: t('common.view'), icon: Eye, onSelect: () => onView(order) },
              ...statuses.map((status) => ({
                label: t('orders.setStatus', { status: t(`status.${status}`) }),
                onSelect: () => onStatus(order, status),
                destructive: status === 'cancelled',
              })),
            ]}
          />
        )
      },
    })

    return columns
  }, [t, locale, canReadCost, onView, getStatuses, onStatus])
}
