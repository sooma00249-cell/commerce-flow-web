import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Renders one input per specification key defined by the selected category.
 * Values live in the parent form as a `{ [key]: string }` object.
 */
export function SpecificationsEditor({ specKeys = [], value = {}, onChange, disabled }) {
  const { t } = useTranslation()

  if (specKeys.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('products.specsNoKeys')}</p>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {specKeys.map((key) => (
        <div key={key} className="space-y-2">
          <Label htmlFor={`spec-${key}`} className="capitalize">
            {key}
          </Label>
          <Input
            id={`spec-${key}`}
            value={value?.[key] ?? ''}
            disabled={disabled}
            onChange={(event) => onChange({ ...value, [key]: event.target.value })}
          />
        </div>
      ))}
    </div>
  )
}
