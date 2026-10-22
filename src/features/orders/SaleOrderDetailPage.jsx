import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useConfirm } from '@/components/ui/useConfirm'
import { formatCurrency, formatDateTime, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils/cn'
import { toastError, toastSuccess } from '@/lib/toast'
import { useAuthStore } from '@/store/auth'
import { useSaleOrder, useUpdateSaleOrderStatus } from './api'
import { OrderStatusActions } from './OrderStatusActions'
import { allowedSaleOrderStatuses, orderReference } from './schema'

function Detail({ label, children, className }) {
  return (
    <div className={cn('space-y-1', className)}>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  )
}

export default function SaleOrderDetailPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const user = useAuthStore((s) => s.user)

  const orderQuery = useSaleOrder(id)
  const updateStatus = useUpdateSaleOrderStatus()
  const [confirm, confirmEl] = useConfirm()

  const order = orderQuery.data
  const canReadCost = hasPermission('products:readCost')

  const statuses = order
    ? allowedSaleOrderStatuses(order, {
        canUpdateStatus: hasPermission('saleOrders:updateStatus'),
        canUpdateDelivery: hasPermission('saleOrders:updateDelivery'),
        isOwner: order.customer?._id === user?.id,
      })
    : []

  const handleStatus = useCallback(
    async (status) => {
      if (!order) return
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
    [confirm, order, updateStatus, t],
  )

  const backButton = (
    <Button variant="ghost" size="sm" asChild>
      <Link to="/sale-orders">
        <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
        {t('saleOrders.backToList')}
      </Link>
    </Button>
  )

  if (orderQuery.isLoading) {
    return (
      <div className="space-y-6">
        {backButton}
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (orderQuery.isError || !order) {
    return (
      <div className="space-y-6">
        {backButton}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t('orders.notFound')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const items = order.items ?? []
  const address = order.address

  return (
    <div className="space-y-6">
      {backButton}

      <PageHeader
        title={`#${orderReference(order._id)}`}
        description={order.customer?.email}
        actions={
          <OrderStatusActions
            statuses={statuses}
            onSelect={handleStatus}
            disabled={updateStatus.isPending}
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('orders.sections.items')}</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('orders.itemsEmpty')}</p>
            ) : (
              <ul className="divide-y rounded-md border">
                {items.map((item, index) => {
                  const product = item.product
                  const lineTotal = item.unitPrice * item.quantity
                  return (
                    <li
                      key={product?._id ?? index}
                      className="flex flex-wrap items-center justify-between gap-3 p-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{product?.title ?? '—'}</p>
                        <p className="truncate text-xs text-muted-foreground">{product?.sku}</p>
                      </div>
                      <div className="flex items-center gap-4 tabular-nums">
                        <span className="text-muted-foreground">
                          × {formatNumber(item.quantity, locale)}
                        </span>
                        <span className="w-24 text-end">
                          {formatCurrency(item.unitPrice, locale)}
                        </span>
                        {canReadCost && item.unitCost != null ? (
                          <span className="w-24 text-end text-muted-foreground">
                            {formatCurrency(item.unitCost, locale)}
                          </span>
                        ) : null}
                        <span className="w-28 text-end font-medium">
                          {formatCurrency(lineTotal, locale)}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            <div className="mt-3 flex items-center justify-between border-t pt-3">
              <span className="text-sm font-medium text-muted-foreground">{t('orders.total')}</span>
              <span className="text-lg font-semibold tabular-nums">
                {formatCurrency(order.total, locale)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('orders.sections.details')}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Detail label={t('orders.fields.status')}>
                <StatusBadge status={order.status} />
              </Detail>
              <Detail label={t('orders.fields.paymentStatus')}>
                <StatusBadge status={order.paymentStatus} />
              </Detail>
              <Detail label={t('orders.fields.paymentMethod')}>
                {t(`orders.paymentMethods.${order.paymentMethod}`)}
              </Detail>
              <Detail label={t('orders.fields.customer')}>
                {order.customer
                  ? [order.customer.firstname, order.customer.lastname]
                      .filter(Boolean)
                      .join(' ') || order.customer.email
                  : '—'}
              </Detail>
              <Detail label={t('orders.sections.address')} className="sm:col-span-2">
                {address ? (
                  <address className="not-italic">
                    {address.street}
                    <br />
                    {address.city}
                    {address.state ? `, ${address.state}` : ''}
                    {address.zipCode ? ` ${address.zipCode}` : ''}
                    <br />
                    {address.country}
                  </address>
                ) : (
                  '—'
                )}
              </Detail>
              <Detail label={t('orders.columns.createdAt')}>
                {formatDateTime(order.createdAt, locale)}
              </Detail>
              <Detail label={t('orders.columns.paidAt')}>
                {formatDateTime(order.paidAt, locale)}
              </Detail>
              <Detail label={t('orders.columns.shippedAt')}>
                {formatDateTime(order.shippedAt, locale)}
              </Detail>
              <Detail label={t('orders.columns.deliveredAt')}>
                {formatDateTime(order.deliveredAt, locale)}
              </Detail>
            </dl>
          </CardContent>
        </Card>
      </div>

      {confirmEl}
    </div>
  )
}
