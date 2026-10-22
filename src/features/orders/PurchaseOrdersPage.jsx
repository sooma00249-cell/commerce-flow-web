import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useConfirm } from '@/components/ui/useConfirm'
import { useTableState } from '@/lib/hooks/useTableState'
import { toastError, toastSuccess } from '@/lib/toast'
import { useAuthStore } from '@/store/auth'
import { usePurchaseOrders, useUpdatePurchaseOrderStatus } from './api'
import { PurchaseOrderDetailDialog } from './PurchaseOrderDetailDialog'
import { PURCHASE_ORDER_STATUSES, allowedPurchaseOrderStatuses, orderReference } from './schema'
import { usePurchaseOrderColumns } from './usePurchaseOrderColumns'

export default function PurchaseOrdersPage() {
  const { t, i18n } = useTranslation()
  const hasPermission = useAuthStore((s) => s.hasPermission)

  const canCreate = hasPermission('purchaseOrders:create')
  const canUpdateStatus = hasPermission('purchaseOrders:updateStatus')

  const table = useTableState({
    defaultSort: [{ id: 'createdAt', desc: true }],
    defaultFilters: { status: 'all' },
  })

  const ordersQuery = usePurchaseOrders(table.params)
  const updateStatus = useUpdatePurchaseOrderStatus()
  const [confirm, confirmEl] = useConfirm()
  const [detailId, setDetailId] = useState(null)

  const orders = useMemo(() => ordersQuery.data?.items ?? [], [ordersQuery.data])
  const detailOrder = useMemo(
    () => orders.find((order) => order._id === detailId) ?? null,
    [orders, detailId],
  )

  const getStatuses = useCallback(
    (order) => allowedPurchaseOrderStatuses(order, { canUpdateStatus }),
    [canUpdateStatus],
  )

  const handleView = useCallback((order) => setDetailId(order._id), [])

  const handleStatus = useCallback(
    async (order, status) => {
      if (status === 'cancelled') {
        const confirmed = await confirm({
          title: t('orders.cancelTitle'),
          description: t('orders.cancelBody', { reference: orderReference(order._id) }),
          confirmLabel: t('orders.cancelAction'),
        })
        if (!confirmed) return
      }
      try {
        await updateStatus.mutateAsync({ id: order._id, status })
        toastSuccess(t('orders.statusChanged', { status: t(`status.${status}`) }))
      } catch (error) {
        toastError(error, t)
      }
    },
    [confirm, updateStatus, t],
  )

  const columns = usePurchaseOrderColumns({
    locale: i18n.language,
    onView: handleView,
    getStatuses,
    onStatus: handleStatus,
  })

  const toolbar = (
    <Select
      value={table.filters.status}
      onValueChange={(value) => table.setFilter('status', value)}
    >
      <SelectTrigger className="w-full sm:w-48" aria-label={t('orders.columns.status')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t('status.all')}</SelectItem>
        {PURCHASE_ORDER_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            {t(`status.${status}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('purchaseOrders.title')}
        description={t('purchaseOrders.subtitle')}
        actions={
          canCreate ? (
            <Button asChild>
              <Link to="/purchase-orders/new">
                <Plus className="size-4" aria-hidden="true" />
                {t('purchaseOrders.new')}
              </Link>
            </Button>
          ) : null
        }
      />

      <DataTable
        columns={columns}
        data={orders}
        isLoading={ordersQuery.isLoading}
        isFetching={ordersQuery.isFetching}
        error={ordersQuery.isError ? ordersQuery.error : null}
        onRetry={() => ordersQuery.refetch()}
        search={{
          value: table.search,
          onChange: table.onSearchChange,
          placeholder: t('purchaseOrders.searchPlaceholder'),
        }}
        toolbar={toolbar}
        sorting={table.sorting}
        onSortingChange={table.onSortingChange}
        pagination={table.pagination}
        onPaginationChange={table.onPaginationChange}
        manual
        total={ordersQuery.data?.meta?.total}
        getRowId={(order) => order._id}
        onRowClick={handleView}
        emptyMessage={t('purchaseOrders.emptyTitle')}
        caption={t('purchaseOrders.title')}
      />

      <PurchaseOrderDetailDialog
        order={detailOrder}
        open={Boolean(detailOrder)}
        onOpenChange={(open) => {
          if (!open) setDetailId(null)
        }}
        statuses={detailOrder ? getStatuses(detailOrder) : []}
        onStatus={(status) => detailOrder && handleStatus(detailOrder, status)}
        busy={updateStatus.isPending}
      />

      {confirmEl}
    </div>
  )
}
