import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
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
import { useSaleOrders, useUpdateSaleOrderStatus } from './api'
import { SALE_ORDER_STATUSES, allowedSaleOrderStatuses, orderReference } from './schema'
import { useSaleOrderColumns } from './useSaleOrderColumns'

export default function SaleOrdersPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const user = useAuthStore((s) => s.user)

  const canReadAll = hasPermission('saleOrders:readAll')
  const canCreate = hasPermission('saleOrders:create')
  const canUpdateStatus = hasPermission('saleOrders:updateStatus')
  const canUpdateDelivery = hasPermission('saleOrders:updateDelivery')

  const table = useTableState({
    defaultSort: [{ id: 'createdAt', desc: true }],
    defaultFilters: { status: 'all' },
  })

  const ordersQuery = useSaleOrders(table.params)
  const updateStatus = useUpdateSaleOrderStatus()
  const [confirm, confirmEl] = useConfirm()

  const getStatuses = useCallback(
    (order) =>
      allowedSaleOrderStatuses(order, {
        canUpdateStatus,
        canUpdateDelivery,
        isOwner: order.customer?._id === user?.id,
      }),
    [canUpdateStatus, canUpdateDelivery, user?.id],
  )

  const handleView = useCallback(
    (order) => navigate(`/sale-orders/${order._id}`),
    [navigate],
  )

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

  const columns = useSaleOrderColumns({
    locale: i18n.language,
    onView: handleView,
    getStatuses,
    onStatus: handleStatus,
  })

  const toolbar = canReadAll ? (
    <Select
      value={table.filters.status}
      onValueChange={(value) => table.setFilter('status', value)}
    >
      <SelectTrigger className="w-full sm:w-48" aria-label={t('orders.columns.status')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t('status.all')}</SelectItem>
        {SALE_ORDER_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            {t(`status.${status}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ) : null

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('saleOrders.title')}
        description={t('saleOrders.subtitle')}
        actions={
          canCreate ? (
            <Button onClick={() => navigate('/sale-orders/new')}>
              <Plus className="size-4" aria-hidden="true" />
              {t('saleOrders.new')}
            </Button>
          ) : null
        }
      />

      <DataTable
        columns={columns}
        data={ordersQuery.data?.items ?? []}
        isLoading={ordersQuery.isLoading}
        isFetching={ordersQuery.isFetching}
        error={ordersQuery.isError ? ordersQuery.error : null}
        onRetry={() => ordersQuery.refetch()}
        search={{
          value: table.search,
          onChange: table.onSearchChange,
          placeholder: t('saleOrders.searchPlaceholder'),
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
        emptyMessage={t('saleOrders.emptyTitle')}
        caption={t('saleOrders.title')}
      />

      {confirmEl}
    </div>
  )
}
