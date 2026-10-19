import { useEffect, useMemo, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { FormError, SelectField, TextField, TextareaField } from '@/components/form/FormField'
import { applyApiErrors } from '@/components/form/useApiFormErrors'
import { entityId } from '@/lib/entity'
import { toastError, toastSuccess } from '@/lib/toast'
import { useCategories } from '@/features/categories/api'
import { useCreateProduct, useProduct, useUpdateProduct } from './api'
import { ProductImagesManager } from './ProductImagesManager'
import { SpecificationsEditor } from './SpecificationsEditor'
import { PRODUCT_STATUSES, buildProductPayload, productDefaults, productSchema } from './schema'

export default function ProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const productQuery = useProduct(id)
  const categoriesQuery = useCategories({ status: 'all', limit: 100, sort: 'title' })
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: productDefaults(null),
  })

  const product = productQuery.data
  const loadedId = useRef(null)

  useEffect(() => {
    if (!product || loadedId.current === product._id) return
    loadedId.current = product._id
    reset(productDefaults(product))
  }, [product, reset])

  const categoryId = watch('category')
  const categories = useMemo(() => categoriesQuery.data?.items ?? [], [categoriesQuery.data])
  const selectedCategory = categories.find((category) => category._id === categoryId)

  const specKeys = useMemo(() => {
    if (selectedCategory) return selectedCategory.specKeys ?? []
    if (isEdit && product) return Object.keys(product.specifications ?? {})
    return []
  }, [selectedCategory, isEdit, product])

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((category) => category.isActive || category._id === categoryId)
        .map((category) => ({
          value: entityId(category),
          label: category.title,
          disabled: !category.isActive,
        })),
    [categories, categoryId],
  )

  const statusOptions = PRODUCT_STATUSES.map((status) => ({
    value: status,
    label: t(`status.${status}`),
  }))

  async function onSubmit(values) {
    const payload = buildProductPayload(values, specKeys)
    try {
      if (isEdit) {
        await updateProduct.mutateAsync({ id, data: payload })
        toastSuccess(t('products.updated'))
      } else {
        const res = await createProduct.mutateAsync(payload)
        toastSuccess(t('products.created'))
        navigate(`/products/${res.data._id}/edit`, { replace: true })
      }
    } catch (error) {
      if (!applyApiErrors(error, setError, clearErrors)) toastError(error, t)
    }
  }

  const backButton = (
    <Button variant="ghost" size="sm" asChild>
      <Link to="/products">
        <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
        {t('products.backToList')}
      </Link>
    </Button>
  )

  if (isEdit && productQuery.isError) {
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

  if (isEdit && productQuery.isLoading) {
    return (
      <div className="space-y-6">
        {backButton}
        <div className="grid gap-6 lg:grid-cols-2">
          {[0, 1].map((index) => (
            <Skeleton key={index} className="h-64 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {backButton}

      <PageHeader
        title={isEdit ? t('products.edit') : t('products.new')}
        description={product?.title}
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <FormError>{errors.specifications?.message}</FormError>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('products.sections.basics')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <TextField
                label={t('products.fields.title')}
                required
                {...register('title')}
                error={errors.title?.message && t(errors.title.message)}
                className="sm:col-span-2"
              />
              <TextField
                label={t('products.fields.sku')}
                required
                placeholder={t('products.fields.skuPlaceholder')}
                {...register('sku')}
                error={errors.sku?.message && t(errors.sku.message)}
              />
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label={t('products.fields.status')}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    options={statusOptions}
                    error={errors.status?.message && t(errors.status.message)}
                  />
                )}
              />
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label={t('products.fields.category')}
                    required
                    placeholder={t('products.fields.categoryPlaceholder')}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={categoriesQuery.isLoading}
                    options={categoryOptions}
                    error={errors.category?.message && t(errors.category.message)}
                    className="sm:col-span-2"
                  />
                )}
              />
              <TextareaField
                label={t('products.fields.description')}
                placeholder={t('products.fields.descriptionPlaceholder')}
                rows={3}
                {...register('description')}
                className="sm:col-span-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('products.sections.pricing')}</CardTitle>
              <CardDescription>{t('products.stockManaged')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <TextField
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                label={t('products.fields.price')}
                required
                {...register('price', { valueAsNumber: true })}
                error={errors.price?.message && t(errors.price.message)}
              />
              <TextField
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                label={t('products.fields.costPrice')}
                required
                {...register('costPrice', { valueAsNumber: true })}
                error={errors.costPrice?.message && t(errors.costPrice.message)}
              />
              <TextField
                type="number"
                inputMode="numeric"
                step="1"
                min="0"
                label={t('products.fields.lowStockThreshold')}
                hint={t('products.fields.lowStockThresholdHint')}
                {...register('lowStockThreshold', { valueAsNumber: true })}
                error={errors.lowStockThreshold?.message && t(errors.lowStockThreshold.message)}
                className="sm:col-span-2"
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('products.sections.specifications')}</CardTitle>
            <CardDescription>
              {categoryId ? t('products.specsNoKeys') : t('products.specsSelectCategory')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Controller
              name="specifications"
              control={control}
              render={({ field }) => (
                <SpecificationsEditor
                  specKeys={categoryId ? specKeys : []}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </CardContent>
        </Card>

        {isEdit && product ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('products.sections.images')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductImagesManager product={product} />
            </CardContent>
          </Card>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="outline" asChild>
            <Link to="/products">{t('common.cancel')}</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : null}
            {isEdit ? t('common.saveChanges') : t('common.create')}
          </Button>
        </div>
      </form>
    </div>
  )
}
