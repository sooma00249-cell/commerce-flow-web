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
import { FormError, SelectField } from '@/components/form/FormField'
import { applyApiErrors } from '@/components/form/useApiFormErrors'
import { toastError, toastSuccess } from '@/lib/toast'
import { useAuthStore } from '@/store/auth'
import { useUsers } from '@/features/users/api'
import { AddressFields } from './AddressFields'
import { OrderItemsEditor } from './OrderItemsEditor'
import { useCreateSaleOrder } from './api'
import { PAYMENT_METHODS, buildSaleOrderPayload, saleOrderDefaults, saleOrderSchema } from './schema'

export default function SaleOrderFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const hasPermission = useAuthStore((s) => s.hasPermission)

  const canChooseCustomer = hasPermission('saleOrders:createForOthers')
  const createOrder = useCreateSaleOrder()
  const customersQuery = useUsers(
    { status: 'active', limit: 100, sort: 'firstname' },
    { enabled: canChooseCustomer },
  )

  const {
    register,
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(saleOrderSchema),
    defaultValues: saleOrderDefaults(),
  })

  const customerOptions = useMemo(
    () =>
      (customersQuery.data?.items ?? [])
        .filter((user) => user.role === 'customer' && user.status === 'active')
        .map((user) => ({
          value: user._id,
          label: [user.firstname, user.lastname].filter(Boolean).join(' ') || user.email,
        })),
    [customersQuery.data],
  )

  const paymentOptions = PAYMENT_METHODS.map((method) => ({
    value: method,
    label: t(`orders.paymentMethods.${method}`),
  }))

  const itemsError = errors.items?.root?.message || errors.items?.message

  async function onSubmit(values) {
    try {
      const res = await createOrder.mutateAsync(buildSaleOrderPayload(values))
      toastSuccess(t('saleOrders.created'))
      navigate(`/sale-orders/${res.data._id}`, { replace: true })
    } catch (error) {
      if (!applyApiErrors(error, setError, clearErrors)) toastError(error, t)
    }
  }

  const backButton = (
    <Button variant="ghost" size="sm" asChild>
      <Link to="/sale-orders">
        <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
        {t('saleOrders.backToList')}
      </Link>
    </Button>
  )

  return (
    <div className="space-y-6">
      {backButton}

      <PageHeader title={t('saleOrders.new')} description={t('saleOrders.subtitle')} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <FormError>{itemsError && t(itemsError)}</FormError>

        <Card>
          <CardHeader>
            <CardTitle>{t('orders.sections.items')}</CardTitle>
            <CardDescription>{t('orders.unitPriceFromCatalog')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Controller
              name="items"
              control={control}
              render={({ field }) => (
                <OrderItemsEditor value={field.value} onChange={field.onChange} mode="sale" />
              )}
            />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('orders.sections.customer')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {canChooseCustomer ? (
                <Controller
                  name="customer"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      label={t('orders.fields.customer')}
                      placeholder={t('orders.fields.customerPlaceholder')}
                      value={field.value}
                      onValueChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={customersQuery.isLoading}
                      options={customerOptions}
                      error={errors.customer?.message && t(errors.customer.message)}
                    />
                  )}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{t('orders.customerIsYou')}</p>
              )}

              <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label={t('orders.fields.paymentMethod')}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    options={paymentOptions}
                    error={errors.paymentMethod?.message && t(errors.paymentMethod.message)}
                  />
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('orders.sections.address')}</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressFields register={register} errors={errors} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="outline" asChild>
            <Link to="/sale-orders">{t('common.cancel')}</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : null}
            {t('saleOrders.create')}
          </Button>
        </div>
      </form>
    </div>
  )
}
