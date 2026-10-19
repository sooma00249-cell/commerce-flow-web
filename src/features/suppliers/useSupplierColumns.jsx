import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2 } from 'lucide-react'
import { RowActionsMenu } from '@/components/common/RowActionsMenu'
import { StatusBadge } from '@/components/common/StatusBadge'

export function useSupplierColumns({ canEdit, canDelete, onEdit, onDelete }) {
  const { t } = useTranslation()

  return useMemo(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: t('suppliers.columns.supplier'),
        enableSorting: true,
        meta: { primary: true },
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium">{row.original.name}</div>
            <div className="truncate text-xs text-muted-foreground md:hidden">
              {row.original.email}
            </div>
          </div>
        ),
      },
      {
        id: 'email',
        accessorKey: 'email',
        header: t('suppliers.columns.email'),
        enableSorting: true,
        meta: { hideOnMobile: true },
        cell: ({ getValue }) => <span className="text-sm">{getValue()}</span>,
      },
      {
        id: 'phone',
        accessorKey: 'phone',
        header: t('suppliers.columns.phone'),
        enableSorting: false,
        meta: { hideOnMobile: true },
        cell: ({ getValue }) =>
          getValue() || <span className="text-muted-foreground">—</span>,
      },
      {
        id: 'location',
        accessorFn: (supplier) =>
          [supplier.address?.city, supplier.address?.country].filter(Boolean).join(', '),
        header: t('suppliers.columns.location'),
        enableSorting: false,
        cell: ({ getValue }) =>
          getValue() || <span className="text-muted-foreground">—</span>,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: t('suppliers.columns.status'),
        enableSorting: false,
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
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
    [t, canEdit, canDelete, onEdit, onDelete],
  )
}
