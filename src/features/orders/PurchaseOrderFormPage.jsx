import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { FormError, SelectField, TextField } from '@/components/form/FormField'
import { applyApiErrors } from '@/components/form/useApiFormErrors'
import { entityId } from '@/lib/entity'
import { toastError, toastSuccess } from '@/lib/toast'
import { useAuthStore } from '@/store/auth'
import { useSuppliers } from '@/features/suppliers/api'
import { OrderItemsEditor } from './OrderItemsEditor'
import { useCreatePurchaseOrder } from './api'
import { buildPurchaseOrderPayload, purchaseOrderDefaults, purchaseOrderSchema } from './schema'

export default function PurchaseOrderFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const canReadCost = useAuthStore((s) => s.hasPermission('products:readCost'))

  const createOrder = useCreatePurchaseOrder()
  const suppliersQuery = useSuppliers({ status: 'active', limit: 100, sort: 'name' })

  const {
    register,
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: purchaseOrderDefaults(),
  })

  const supplierOptions = useMemo(
    () =>
      (suppliersQuery.data?.items ?? []).map((supplier) => ({
        value: entityId(supplier),
        label: supplier.name,
        disabled: supplier.status !== 'active',
      })),
    [suppliersQuery.data],
  )

  const itemsError = errors.items?.root?.message || errors.items?.message

  async function onSubmit(values) {
    try {
      await createOrder.mutateAsync(buildPurchaseOrderPayload(values))
      toastSuccess(t('purchaseOrders.created'))
      navigate('/purchase-orders', { replace: true })
    } catch (error) {
      if (!applyApiErrors(error, setError, clearErrors)) toastError(error, t)
    }
  }

  const backButton = (
    <Button variant="ghost" size="sm" asChild>
      <Link to="/purchase-orders">
        <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
        {t('purchaseOrders.backToList')}
      </Link>
    </Button>
  )

  return (
    <div className="space-y-6">
      {backButton}

      <PageHeader title={t('purchaseOrders.new')} description={t('purchaseOrders.subtitle')} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <FormError>{itemsError && t(itemsError)}</FormError>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('orders.sections.supplier')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Controller
                name="supplier"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label={t('orders.fields.supplier')}
                    required
                    placeholder={t('orders.fields.supplierPlaceholder')}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={suppliersQuery.isLoading}
                    options={supplierOptions}
                    error={errors.supplier?.message && t(errors.supplier.message)}
                  />
                )}
              />
              <TextField
                type="date"
                label={t('orders.fields.expectedDelivery')}
                hint={t('orders.fields.expectedDeliveryHint')}
                {...register('expectedDeliveryDate')}
                error={errors.expectedDeliveryDate?.message && t(errors.expectedDeliveryDate.message)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('orders.sections.items')}</CardTitle>
              <CardDescription>
            {canReadCost ? t('orders.unitCostFromCatalog') : t('orders.costHidden')}
          </CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                name="items"
                control={control}
                render={({ field }) => (
                  <OrderItemsEditor
                    value={field.value}
                    onChange={field.onChange}
                    mode="purchase"
                  />
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="outline" asChild>
            <Link to="/purchase-orders">{t('common.cancel')}</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : null}
            {t('purchaseOrders.create')}
          </Button>
        </div>
      </form>
    </div>
  )
}
