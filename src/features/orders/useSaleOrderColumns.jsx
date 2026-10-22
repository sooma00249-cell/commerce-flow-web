import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye } from 'lucide-react'
import { RowActionsMenu } from '@/components/common/RowActionsMenu'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatCurrency, formatDate, formatNumber } from '@/lib/format'
import { orderReference } from './schema'

/**
 * Sale-order table columns.
 *
 * Sortable columns map 1:1 onto the API's sort whitelist
 * (`createdAt`, `total`, `status`, `paidAt`).
 */
export function useSaleOrderColumns({ locale, onView, getStatuses, onStatus }) {
  const { t } = useTranslation()

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
              {row.original.customer?.email}
            </div>
          </div>
        ),
      },
      {
        id: 'customer',
        accessorFn: (order) => order.customer?.firstname ?? '',
        header: t('orders.columns.customer'),
        enableSorting: false,
        meta: { subtitle: true },
        cell: ({ row }) => {
          const customer = row.original.customer
          if (!customer) return <span className="text-muted-foreground">—</span>
          return (
            <div className="min-w-0">
              <div className="truncate">
                {[customer.firstname, customer.lastname].filter(Boolean).join(' ') || customer.email}
              </div>
              <div className="truncate text-xs text-muted-foreground">{customer.email}</div>
            </div>
          )
        },
      },
      {
        id: 'shipTo',
        accessorFn: (order) =>
          [order.address?.city, order.address?.country].filter(Boolean).join(', '),
        header: t('orders.columns.shipTo'),
        enableSorting: false,
        meta: { hideBelow: 'xl' },
        cell: ({ getValue }) =>
          getValue() || <span className="text-muted-foreground">—</span>,
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
        cell: ({ getValue }) => <span className="tabular-nums">{formatCurrency(getValue(), locale)}</span>,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: t('orders.columns.status'),
        enableSorting: true,
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
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
        id: 'paidAt',
        accessorKey: 'paidAt',
        header: t('orders.columns.paidAt'),
        enableSorting: true,
        meta: { hideOnMobile: true },
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{formatDate(getValue(), locale)}</span>
        ),
      },
      {
        id: 'payment',
        accessorFn: (order) => order.paymentMethod ?? '',
        header: t('orders.columns.payment'),
        enableSorting: false,
        meta: { hideBelow: 'xl' },
        cell: ({ row }) => {
          const order = row.original
          return (
            <div className="min-w-0">
              <div className="truncate">{t(`orders.paymentMethods.${order.paymentMethod || 'cod'}`)}</div>
              <div className="truncate text-xs text-muted-foreground">
                {t(`status.${order.paymentStatus || 'pending'}`)}
              </div>
            </div>
          )
        },
      },
      {
        id: 'deliveredAt',
        accessorKey: 'deliveredAt',
        header: t('orders.columns.deliveredAt'),
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
  }, [t, locale, onView, getStatuses, onStatus])
}
