import { useTranslation } from 'react-i18next'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * Per-row overflow menu for tables.
 *
 * `items` is a list of `{ label, icon?, onSelect, destructive?, disabled? }` or
 * `{ separator: true }`. Rendered inside a table row, so clicks are stopped
 * from propagating to any row-level handler.
 */
export function RowActionsMenu({ items, label }) {
  const { t } = useTranslation()
  const visible = items.filter(Boolean)
  if (visible.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={label || t('common.actions')}
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
        {visible.map((item, index) => {
          if (item.separator) return <DropdownMenuSeparator key={`sep-${index}`} />
          const Icon = item.icon
          return (
            <DropdownMenuItem
              key={item.label}
              disabled={item.disabled}
              onSelect={item.onSelect}
              className={item.destructive ? 'text-destructive focus:text-destructive' : undefined}
            >
              {Icon ? <Icon className="size-4" aria-hidden="true" /> : null}
              {item.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
