import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { entityId } from '@/lib/entity'
import { formatCurrency, formatNumber } from '@/lib/format'
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue'
import { cn } from '@/lib/utils/cn'
import { useProducts } from '@/features/products/api'

/**
 * Type-ahead product picker.
 *
 * Searches the catalog through the API (server-side `q` + `status=active`) and
 * exposes the matches as an ARIA combobox so keyboard and screen-reader users
 * can pick a product without a mouse.
 *
 * `inStockOnly` hides products without free stock (stock minus what pending
 * orders already reserved) — sale orders use it, purchase orders do not since
 * ordering a sold-out product is exactly how it gets restocked.
 */
export function ProductSearchInput({
  onSelect,
  disabled,
  priceKey = 'price',
  inStockOnly = false,
  hidePrice = false,
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const listboxId = useId()

  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const debouncedTerm = useDebouncedValue(term, 300)
  const containerRef = useRef(null)

  const productsQuery = useProducts(
    { q: debouncedTerm, status: 'active', limit: 8, sort: 'title', inStock: inStockOnly ? 'true' : undefined },
    { enabled: open },
  )
  const products = productsQuery.data?.items ?? []

  useEffect(() => {
    if (!open) return undefined
    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  function handleSelect(product) {
    onSelect(product)
    setTerm('')
    setOpen(false)
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
      if (products.length === 0) return
      setActiveIndex((current) => {
        const delta = event.key === 'ArrowDown' ? 1 : -1
        return (current + delta + products.length) % products.length
      })
      return
    }
    if (event.key === 'Enter') {
      const product = products[activeIndex]
      if (open && product) {
        event.preventDefault()
        handleSelect(product)
      }
      return
    }
    if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const activeProduct = open ? products[activeIndex] : null

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeProduct ? `${listboxId}-${entityId(activeProduct)}` : undefined
          }
          aria-label={t('orders.searchProducts')}
          autoComplete="off"
          value={term}
          disabled={disabled}
          placeholder={t('orders.searchProducts')}
          onChange={(event) => {
            setTerm(event.target.value)
            setActiveIndex(0)
            setOpen(true)
          }}
          onFocus={() => {
            setActiveIndex(0)
            setOpen(true)
          }}
          onKeyDown={handleKeyDown}
          className="ps-9"
        />
        {productsQuery.isFetching ? (
          <Spinner
            className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        ) : null}
      </div>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={t('orders.searchProducts')}
          className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {products.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              {productsQuery.isFetching
                ? t('orders.searching')
                : inStockOnly
                  ? t('orders.noProductsInStock')
                  : t('orders.noProducts')}
            </li>
          ) : (
            products.map((product, index) => {
              const available = Math.max(
                0,
                Number(product.stock || 0) - Number(product.reserved || 0),
              )
              const stockLabel = inStockOnly
                ? `${t('orders.available')} ${formatNumber(available, locale)}`
                : `${t('orders.stock')} ${formatNumber(product.stock, locale)}`
              return (
                <li
                  key={entityId(product)}
                  id={`${listboxId}-${entityId(product)}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(product)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-3 rounded-sm px-3 py-2 text-sm',
                    index === activeIndex && 'bg-accent text-accent-foreground',
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{product.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{product.sku}</span>
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {hidePrice
                      ? stockLabel
                      : `${formatCurrency(product[priceKey], locale)} · ${stockLabel}`}
                  </span>
                </li>
              )
            })
          )}
        </ul>
      ) : null}
    </div>
  )
}
