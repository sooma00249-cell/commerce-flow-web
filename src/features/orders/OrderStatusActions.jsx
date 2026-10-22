import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

/**
 * Buttons for the status transitions the current user is allowed to perform.
 * Cancelling is destructive, so it gets the outline treatment plus a red label.
 */
export function OrderStatusActions({ statuses = [], onSelect, disabled = false, size = 'sm' }) {
  const { t } = useTranslation()
  if (statuses.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {statuses.map((status) => (
        <Button
          key={status}
          type="button"
          size={size}
          variant={status === 'cancelled' ? 'outline' : 'default'}
          disabled={disabled}
          className={status === 'cancelled' ? 'border-destructive/40 text-destructive' : undefined}
          onClick={() => onSelect(status)}
        >
          {t('orders.setStatus', { status: t(`status.${status}`) })}
        </Button>
      ))}
    </div>
  )
}
