import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { entityId } from '@/lib/entity'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils/cn'
import { useAuthStore } from '@/store/auth'
import { ProductSearchInput } from './ProductSearchInput'

/**
 * Line-item editor shared by sale and purchase orders.
 *
 * The value is the plain `{ product, quantity }[]` shape the API expects; the
 * picked product documents are kept locally so the rows can show title, SKU
 * and unit price. `mode` decides whether the unit price shown is the selling
 * price (sale orders) or the cost price (purchase orders).
 *
 * Purchase rows hide every money figure unless the signed-in user holds
 * `products:readCost` — the API redacts the cost prices for everyone else, so
 * the UI must not pretend a total it cannot compute.
 */
export function OrderItemsEditor({ value = [], onChange, mode = 'sale', disabled = false }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const canReadCost = useAuthStore((s) => s.hasPermission('products:readCost'))
  const [catalog, setCatalog] = useState({})

  const items = Array.isArray(value) ? value : []
  const priceKey = mode === 'purchase' ? 'costPrice' : 'price'
  const hideCosts = mode === 'purchase' && !canReadCost

  const rows = items.map((item) => {
    const product = catalog[item.product]
    const unit = product ? Number(product[priceKey]) : NaN
    const quantity = Number(item.quantity)
    const lineTotal = Number.isFinite(unit) && Number.isFinite(quantity) ? unit * quantity : NaN
    return { item, product, unit, lineTotal }
  })

  const total = rows.reduce((sum, row) => (Number.isFinite(row.lineTotal) ? sum + row.lineTotal : sum), 0)
  const hasHiddenCost = hideCosts || rows.some((row) => row.product && !row.product.costPrice)

  function handleSelect(product) {
    const id = entityId(product)
    setCatalog((current) => ({ ...current, [id]: product }))
    onChange([...items, { product: id, quantity: 1 }])
  }

  function handleQuantity(index, raw) {
    const quantity = raw === '' ? '' : Number(raw)
    onChange(items.map((item, i) => (i === index ? { ...item, quantity } : item)))
  }

  function handleRemove(index) {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <ProductSearchInput
        onSelect={handleSelect}
        disabled={disabled}
        priceKey={priceKey}
        hidePrice={hideCosts}
        inStockOnly={mode === 'sale'}
      />

      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          {t('orders.itemsEmpty')}
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row, index) => {
            const quantityError = validateQuantity(row.item.quantity, t)
            const stockError = validateStock(row, mode, t)
            return (
              <li key={row.item.product || index} className="rounded-md border p-3">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="min-w-40 flex-1">
                    <p className="font-medium">{row.product?.title ?? row.item.product}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.product?.sku ?? t('orders.unknownProduct')}
                    </p>
                  </div>

                  <div className="w-24">
                    <label
                      htmlFor={`order-item-quantity-${index}`}
                      className="mb-1 block text-xs font-medium text-muted-foreground"
                    >
                      {t('orders.quantity')}
                    </label>
                    <Input
                      id={`order-item-quantity-${index}`}
                      type="number"
                      inputMode="numeric"
                      min="1"
                      step="1"
                      value={row.item.quantity}
                      disabled={disabled}
                      aria-invalid={quantityError || stockError ? true : undefined}
                      aria-describedby={
                        quantityError || stockError
                          ? `order-item-quantity-error-${index}`
                          : undefined
                      }
                      onChange={(event) => handleQuantity(index, event.target.value)}
                    />
                  </div>

                  <div className="w-28 text-end">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      {t('orders.lineTotal')}
                    </p>
                    <p className="tabular-nums font-medium">
                      {hideCosts
                        ? t('orders.costHidden')
                        : Number.isFinite(row.lineTotal)
                          ? formatCurrency(row.lineTotal, locale)
                          : '—'}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={disabled}
                    aria-label={t('orders.removeItem')}
                    onClick={() => handleRemove(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>

                {quantityError || stockError ? (
                  <p
                    id={`order-item-quantity-error-${index}`}
                    role="alert"
                    className="mt-2 text-sm text-destructive"
                  >
                    {quantityError || stockError}
                  </p>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}

      <div className="flex items-center justify-between border-t pt-3">
        <span className="text-sm font-medium text-muted-foreground">{t('orders.total')}</span>
        <span
          className={cn(
            'text-lg font-semibold tabular-nums',
            hasHiddenCost && 'text-muted-foreground',
          )}
        >
          {mode === 'purchase' && hasHiddenCost
            ? t('orders.costHidden')
            : formatCurrency(total, locale)}
        </span>
      </div>

      {mode === 'sale' ? (
        <p className="text-xs text-muted-foreground">{t('orders.unitPriceFromCatalog')}</p>
      ) : null}
    </div>
  )
}

/** Inline quantity validation — mirrors the zod rule for the same field. */
function validateQuantity(value, t) {
  if (value === '' || value === null || value === undefined) return t('validation.required')
  const quantity = Number(value)
  if (!Number.isFinite(quantity)) return t('validation.number')
  if (!Number.isInteger(quantity)) return t('validation.integer')
  if (quantity < 1) return t('validation.min', { min: 1 })
  return null
}

/**
 * Sale orders can only take what is free right now (stock minus the units
 * already reserved by pending orders) — the API rejects the order otherwise.
 */
function validateStock(row, mode, t) {
  if (mode !== 'sale' || !row.product) return null
  const quantity = Number(row.item.quantity)
  if (!Number.isFinite(quantity) || quantity < 1) return null
  const available = Math.max(
    0,
    Number(row.product.stock || 0) - Number(row.product.reserved || 0),
  )
  if (quantity <= available) return null
  return t('orders.insufficientStock', { available })
}
