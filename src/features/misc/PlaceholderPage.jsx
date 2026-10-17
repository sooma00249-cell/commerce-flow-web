import { useTranslation } from 'react-i18next'
import { Construction } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

/** Temporary page for sections that are planned but not built yet. */
export default function PlaceholderPage({ titleKey }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t(titleKey)}</h1>
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
          <Construction className="size-8" aria-hidden="true" />
          <p>{t('common.empty')}</p>
        </CardContent>
      </Card>
    </div>
  )
}
