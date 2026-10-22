import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatCurrency, formatDate, formatNumber } from '@/lib/format'
import { useAuthStore } from '@/store/auth'
import { orderReference } from './schema'
import { OrderStatusActions } from './OrderStatusActions'

function Meta({ label, children }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  )
}

/**
 * Purchase-order details.
 *
 * The API has no `GET /purchase-orders/:id`, so the dialog renders the order
 * that the list already loaded instead of fetching it again.
 */
export function PurchaseOrderDetailDialog({
  order,
  open,
  onOpenChange,
  statuses = [],
  onStatus,
  busy = false,
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const canReadCost = useAuthStore((s) => s.hasPermission('products:readCost'))

  if (!order) return null

  const items = order.items ?? []
  // Unit costs and the money totals are only for users allowed to read them.
  const showCost = canReadCost && items.every((item) => item.unitCost != null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            #{orderReference(order._id)}
            <StatusBadge status={order.status} />
          </DialogTitle>
          <DialogDescription>
            {order.supplier?.name ?? t('orders.unknownSupplier')}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Meta label={t('orders.columns.supplier')}>
              <div>{order.supplier?.name ?? '—'}</div>
              {order.supplier?.email ? (
                <div className="text-xs text-muted-foreground">{order.supplier.email}</div>
              ) : null}
            </Meta>
            <Meta label={t('orders.columns.expectedDelivery')}>
              {formatDate(order.expectedDeliveryDate, locale)}
            </Meta>
            <Meta label={t('orders.columns.createdAt')}>
              {formatDate(order.createdAt, locale)}
            </Meta>
            <Meta label={t('orders.columns.receivedAt')}>
              {formatDate(order.receivedAt, locale)}
            </Meta>
          </dl>

          <div>
            <h3 className="mb-2 text-sm font-semibold">{t('orders.items')}</h3>
            <ul className="divide-y rounded-md border">
              {items.map((item, index) => {
                const product = item.product
                const lineTotal =
                  item.unitCost != null ? item.unitCost * item.quantity : Number.NaN
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
                        {showCost && item.unitCost != null
                          ? formatCurrency(item.unitCost, locale)
                          : t('orders.costHidden')}
                      </span>
                      <span className="w-28 text-end font-medium">
                        {showCost && Number.isFinite(lineTotal)
                          ? formatCurrency(lineTotal, locale)
                          : showCost
                            ? '—'
                            : t('orders.costHidden')}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="mt-3 flex items-center justify-between border-t pt-3">
              <span className="text-sm font-medium text-muted-foreground">{t('orders.total')}</span>
              <span className="text-lg font-semibold tabular-nums">
                {showCost ? formatCurrency(order.total, locale) : t('orders.costHidden')}
              </span>
            </div>
          </div>
        </div>

        <OrderStatusActions statuses={statuses} onSelect={onStatus} disabled={busy} />
      </DialogContent>
    </Dialog>
  )
}
