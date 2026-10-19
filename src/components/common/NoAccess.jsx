import { useTranslation } from 'react-i18next'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/** Shown when the signed-in user lacks the permission for the current view. */
export function NoAccess({ onHome }) {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <ShieldAlert className="mx-auto mb-1 size-8 text-muted-foreground" aria-hidden="true" />
          <CardTitle>{t('errors.forbiddenTitle')}</CardTitle>
          <CardDescription>{t('errors.forbiddenBody')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={onHome || (() => window.location.assign('/'))}>
            {t('errors.goHome')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
