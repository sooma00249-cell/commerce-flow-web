import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDateTime, formatNumber } from '@/lib/format'
import { useAuthStore } from '@/store/auth'
import { useProduct } from './api'

function Detail({ label, children }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm">{children}</dd>
    </div>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const hasPermission = useAuthStore((s) => s.hasPermission)

  const productQuery = useProduct(id)
  const product = productQuery.data

  const backButton = (
    <Button variant="ghost" size="sm" asChild>
      <Link to="/products">
        <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
        {t('products.backToList')}
      </Link>
    </Button>
  )

  if (productQuery.isLoading) {
    return (
      <div className="space-y-6">
        {backButton}
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-72 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (productQuery.isError || !product) {
    return (
      <div className="space-y-6">
        {backButton}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t('products.notFound')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const images = product.images ?? []
  const specifications = Object.entries(product.specifications ?? {})

  return (
    <div className="space-y-6">
      {backButton}

      <PageHeader
        title={product.title}
        description={product.sku}
        actions={
          hasPermission('products:update') ? (
            <Button asChild>
              <Link to={`/products/${product._id}/edit`}>
                <Pencil className="size-4" aria-hidden="true" />
                {t('common.edit')}
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('products.sections.basics')}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Detail label={t('products.fields.status')}>
                <StatusBadge status={product.status} />
              </Detail>
              <Detail label={t('products.fields.category')}>
                {product.category?.title || '—'}
              </Detail>
              <Detail label={t('products.fields.price')}>
                <span className="tabular-nums">{formatCurrency(product.price, locale)}</span>
              </Detail>
              {hasPermission('products:readCost') ? (
                <Detail label={t('products.fields.costPrice')}>
                  <span className="tabular-nums">{formatCurrency(product.costPrice, locale)}</span>
                </Detail>
              ) : null}
              <Detail label={t('products.columns.stock')}>
                <span className="tabular-nums">{formatNumber(product.stock, locale)}</span>
              </Detail>
              <Detail label={t('products.fields.lowStockThreshold')}>
                <span className="tabular-nums">
                  {formatNumber(product.lowStockThreshold, locale)}
                </span>
              </Detail>
              <Detail label={t('products.fields.description')}>
                <span className="whitespace-pre-line">
                  {product.description || <span className="text-muted-foreground">—</span>}
                </span>
              </Detail>
              <Detail label={t('common.createdAt')}>
                {formatDateTime(product.createdAt, locale)}
              </Detail>
              <Detail label={t('common.updatedAt')}>
                {formatDateTime(product.updatedAt, locale)}
              </Detail>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('products.sections.images')}</CardTitle>
          </CardHeader>
          <CardContent>
            {images.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('products.imagesEmpty')}</p>
            ) : (
              <ul className="grid grid-cols-2 gap-3">
                {images.map((url, index) => (
                  <li key={url}>
                    <img
                      src={url}
                      alt={t('products.imageAlt', { title: product.title, index: index + 1 })}
                      loading="lazy"
                      className="aspect-square w-full rounded-md border bg-muted object-cover"
                    />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {specifications.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('products.sections.specifications')}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {specifications.map(([key, value]) => (
                <Detail key={key} label={key}>
                  {value}
                </Detail>
              ))}
            </dl>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
