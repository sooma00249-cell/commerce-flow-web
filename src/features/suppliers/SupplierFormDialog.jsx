import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { FormError, SelectField, TextField } from '@/components/form/FormField'
import { applyApiErrors } from '@/components/form/useApiFormErrors'
import { toastError, toastSuccess } from '@/lib/toast'
import { useCreateSupplier, useUpdateSupplier } from './api'
import {
  ADDRESS_KEYS,
  SUPPLIER_STATUSES,
  buildSupplierPayload,
  supplierDefaults,
  supplierSchema,
} from './schema'

function SupplierForm({ supplier, onOpenChange }) {
  const { t } = useTranslation()
  const isEdit = Boolean(supplier)

  const createSupplier = useCreateSupplier()
  const updateSupplier = useUpdateSupplier()

  const {
    register,
    control,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: supplierDefaults(supplier),
  })

  const hasAddress = watch('hasAddress')

  const statusOptions = SUPPLIER_STATUSES.map((status) => ({
    value: status,
    label: t(`status.${status}`),
  }))

  async function onSubmit(values) {
    const payload = buildSupplierPayload(values, { includeStatus: isEdit })
    try {
      if (isEdit) {
        await updateSupplier.mutateAsync({ id: supplier._id, data: payload })
        toastSuccess(t('suppliers.updated'))
      } else {
        await createSupplier.mutateAsync(payload)
        toastSuccess(t('suppliers.created'))
      }
      onOpenChange(false)
    } catch (error) {
      if (!applyApiErrors(error, setError, clearErrors)) toastError(error, t)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
      <DialogHeader>
        <DialogTitle>{isEdit ? t('suppliers.edit') : t('suppliers.new')}</DialogTitle>
        <DialogDescription>{t('suppliers.subtitle')}</DialogDescription>
      </DialogHeader>

      <TextField
        label={t('suppliers.fields.name')}
        required
        placeholder={t('suppliers.fields.namePlaceholder')}
        {...register('name')}
        error={errors.name?.message && t(errors.name.message)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          type="email"
          label={t('suppliers.fields.email')}
          required
          placeholder={t('suppliers.fields.emailPlaceholder')}
          {...register('email')}
          error={errors.email?.message && t(errors.email.message)}
        />
        <TextField
          type="tel"
          label={t('suppliers.fields.phone')}
          placeholder={t('suppliers.fields.phonePlaceholder')}
          {...register('phone')}
          error={errors.phone?.message && t(errors.phone.message)}
        />
      </div>

      {isEdit ? (
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <SelectField
              label={t('suppliers.fields.status')}
              value={field.value}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              options={statusOptions}
              error={errors.status?.message && t(errors.status.message)}
            />
          )}
        />
      ) : null}

      <Controller
        name="hasAddress"
        control={control}
        render={({ field }) => (
          <div className="flex items-center justify-between gap-4 rounded-md border p-3">
            <Label htmlFor="supplier-address">
              {t('address.add')}
              {hasAddress ? null : (
                <span className="ms-1 text-muted-foreground">({t('common.optional')})</span>
              )}
            </Label>
            <Switch
              id="supplier-address"
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={field.disabled}
            />
          </div>
        )}
      />

      {hasAddress ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {ADDRESS_KEYS.map((key) => (
            <TextField
              key={key}
              label={t(`address.${key}`)}
              required
              {...register(`address.${key}`)}
              error={errors.address?.[key]?.message && t(errors.address[key].message)}
              className={key === 'street' ? 'sm:col-span-2' : undefined}
            />
          ))}
          {/* Server-side fallback: the API reports an incomplete address as one
              error on the `address` object instead of per field. */}
          <FormError className="sm:col-span-2">{errors.address?.message}</FormError>
        </div>
      ) : null}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : null}
          {isEdit ? t('common.save') : t('common.create')}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function SupplierFormDialog({ open, onOpenChange, supplier }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] max-w-xl overflow-y-auto">
        <SupplierForm supplier={supplier} onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  )
}
