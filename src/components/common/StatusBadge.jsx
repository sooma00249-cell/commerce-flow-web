import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'

/** Maps every backend status string to both a colour and a translated label. */
const VARIANT_BY_STATUS = {
  active: 'success',
  inactive: 'muted',
  draft: 'warning',
  pending: 'warning',
  paid: 'info',
  shipped: 'info',
  delivered: 'success',
  ordered: 'info',
  received: 'success',
  cancelled: 'destructive',
  paidPartial: 'warning',
}

export function StatusBadge({ status, className }) {
  const { t } = useTranslation()
  return (
    <Badge variant={VARIANT_BY_STATUS[status] || 'secondary'} className={className}>
      {t(`status.${status}`, { defaultValue: status })}
    </Badge>
  )
}
