import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useConfirm } from '@/components/ui/useConfirm'
import { entityId } from '@/lib/entity'
import { useTableState } from '@/lib/hooks/useTableState'
import { toastError, toastSuccess } from '@/lib/toast'
import { useAuthStore } from '@/store/auth'
import { useDeleteSupplier, useSuppliers } from './api'
import { SUPPLIER_STATUSES } from './schema'
import { SupplierFormDialog } from './SupplierFormDialog'
import { useSupplierColumns } from './useSupplierColumns'

export default function SuppliersPage() {
  const { t } = useTranslation()
  const hasPermission = useAuthStore((s) => s.hasPermission)

  const canCreate = hasPermission('suppliers:create')
  const canEdit = hasPermission('suppliers:update')
  const canDelete = hasPermission('suppliers:delete')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const table = useTableState({
    defaultSort: [{ id: 'name', desc: false }],
    defaultFilters: { status: 'all' },
  })

  const suppliersQuery = useSuppliers(table.params)
  const deleteSupplier = useDeleteSupplier()
  const [confirm, confirmEl] = useConfirm()

  const suppliers = suppliersQuery.data?.items ?? []
  const editing = editingId ? suppliers.find((item) => entityId(item) === editingId) : null

  const handleCreate = useCallback(() => {
    setEditingId(null)
    setDialogOpen(true)
  }, [])

  const handleEdit = useCallback((supplier) => {
    setEditingId(entityId(supplier))
    setDialogOpen(true)
  }, [])

  const handleDelete = useCallback(
    async (supplier) => {
      const confirmed = await confirm({
        title: t('suppliers.deleteTitle'),
        description: t('suppliers.deleteBody', { name: supplier.name }),
        confirmLabel: t('common.delete'),
      })
      if (!confirmed) return
      try {
        const res = await deleteSupplier.mutateAsync(entityId(supplier))
        toastSuccess(
          res?.data?.deactivated ? t('suppliers.deactivated') : t('suppliers.deleted'),
        )
      } catch (error) {
        toastError(error, t)
      }
    },
    [confirm, deleteSupplier, t],
  )

  const columns = useSupplierColumns({
    canEdit,
    canDelete,
    onEdit: handleEdit,
    onDelete: handleDelete,
  })

  const toolbar = (
    <Select
      value={table.filters.status}
      onValueChange={(value) => table.setFilter('status', value)}
    >
      <SelectTrigger className="w-full sm:w-40" aria-label={t('suppliers.columns.status')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t('status.all')}</SelectItem>
        {SUPPLIER_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            {t(`status.${status}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('suppliers.title')}
        description={t('suppliers.subtitle')}
        actions={
          canCreate ? (
            <Button onClick={handleCreate}>
              <Plus className="size-4" aria-hidden="true" />
              {t('suppliers.new')}
            </Button>
          ) : null
        }
      />

      <DataTable
        columns={columns}
        data={suppliers}
        isLoading={suppliersQuery.isLoading}
        isFetching={suppliersQuery.isFetching}
        error={suppliersQuery.isError ? suppliersQuery.error : null}
        onRetry={() => suppliersQuery.refetch()}
        search={{
          value: table.search,
          onChange: table.onSearchChange,
          placeholder: t('suppliers.searchPlaceholder'),
        }}
        toolbar={toolbar}
        sorting={table.sorting}
        onSortingChange={table.onSortingChange}
        pagination={table.pagination}
        onPaginationChange={table.onPaginationChange}
        manual
        total={suppliersQuery.data?.meta?.total}
        getRowId={(supplier) => entityId(supplier)}
        emptyMessage={t('suppliers.emptyBody')}
        caption={t('suppliers.title')}
      />

      <SupplierFormDialog open={dialogOpen} onOpenChange={setDialogOpen} supplier={editing} />

      {confirmEl}
    </div>
  )
}
