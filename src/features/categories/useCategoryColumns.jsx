import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EntityThumbnail } from '@/components/common/EntityThumbnail'
import { RowActionsMenu } from '@/components/common/RowActionsMenu'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate } from '@/lib/format'

const MAX_VISIBLE_SPEC_KEYS = 3

export function useCategoryColumns({ canEdit, canDelete, onEdit, onDelete }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  return useMemo(
    () => [
      {
        id: 'title',
        accessorKey: 'title',
        header: t('categories.columns.category'),
        enableSorting: true,
        meta: { primary: true },
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <EntityThumbnail src={row.original.image} kind="category" />
            <div className="min-w-0">
              <div className="truncate font-medium">{row.original.title}</div>
              <div className="truncate font-mono text-xs text-muted-foreground">
                {row.original.slug}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'slug',
        accessorKey: 'slug',
        header: t('categories.columns.slug'),
        enableSorting: true,
        meta: { hideOnMobile: true },
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-muted-foreground">{getValue()}</span>
        ),
      },
      {
        id: 'specKeys',
        accessorFn: (category) => category.specKeys?.length ?? 0,
        header: t('categories.columns.specs'),
        enableSorting: false,
        cell: ({ row }) => {
          const keys = row.original.specKeys ?? []
          if (keys.length === 0) {
            return <span className="text-muted-foreground">{t('categories.noSpecs')}</span>
          }
          const visible = keys.slice(0, MAX_VISIBLE_SPEC_KEYS)
          const extra = keys.length - visible.length
          return (
            <div className="flex flex-wrap gap-1">
              {visible.map((key) => (
                <Badge key={key} variant="secondary">
                  {key}
                </Badge>
              ))}
              {extra > 0 ? <Badge variant="muted">+{extra}</Badge> : null}
            </div>
          )
        },
      },
      {
        id: 'status',
        accessorFn: (category) => (category.isActive ? 'active' : 'inactive'),
        header: t('categories.columns.status'),
        enableSorting: false,
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
      },
      {
        id: 'updatedAt',
        accessorKey: 'updatedAt',
        header: t('common.updatedAt'),
        enableSorting: false,
        meta: { hideBelow: 'xl' },
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{formatDate(getValue(), locale)}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        meta: { actions: true, align: 'end' },
        cell: ({ row }) => (
          <RowActionsMenu
            items={[
              canEdit
                ? { label: t('common.edit'), icon: Pencil, onSelect: () => onEdit(row.original) }
                : null,
              canDelete
                ? {
                    label: t('common.delete'),
                    icon: Trash2,
                    destructive: true,
                    onSelect: () => onDelete(row.original),
                  }
                : null,
            ]}
          />
        ),
      },
    ],
    [t, locale, canEdit, canDelete, onEdit, onDelete],
  )
}
