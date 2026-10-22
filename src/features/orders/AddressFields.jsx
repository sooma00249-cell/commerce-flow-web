import { useTranslation } from 'react-i18next'
import { TextField } from '@/components/form/FormField'
import { ADDRESS_KEYS } from '@/lib/address'
import { cn } from '@/lib/utils/cn'

/**
 * Shipping / billing address inputs.
 *
 * `register` and `errors` come straight from react-hook-form, so each input
 * keeps its own validation message.
 */
export function AddressFields({ register, errors, className }) {
  const { t } = useTranslation()

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4', className)}>
      {ADDRESS_KEYS.map((key) => (
        <TextField
          key={key}
          label={t(`address.${key}`)}
          required
          {...register(`address.${key}`)}
          error={errors.address?.[key]?.message && t(errors.address[key].message)}
          className={
            key === 'street' ? 'sm:col-span-2 lg:col-span-3 2xl:col-span-4' : undefined
          }
        />
      ))}
    </div>
  )
}
