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
import { useCategories, useDeleteCategory } from './api'
import { CategoryFormDialog } from './CategoryFormDialog'
import { useCategoryColumns } from './useCategoryColumns'

const STATUS_OPTIONS = ['active', 'inactive']

export default function CategoriesPage() {
  const { t } = useTranslation()
  const hasPermission = useAuthStore((s) => s.hasPermission)

  const canCreate = hasPermission('categories:create')
  const canEdit = hasPermission('categories:update')
  const canDelete = hasPermission('categories:delete')
  const canReadAll = hasPermission('categories:readAll')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const table = useTableState({
    defaultSort: [{ id: 'title', desc: false }],
    defaultFilters: { status: 'all' },
  })

  const categoriesQuery = useCategories(table.params)
  const deleteCategory = useDeleteCategory()
  const [confirm, confirmEl] = useConfirm()

  const categories = categoriesQuery.data?.items ?? []
  const editing = editingId ? categories.find((item) => entityId(item) === editingId) : null

  const handleCreate = useCallback(() => {
    setEditingId(null)
    setDialogOpen(true)
  }, [])

  const handleEdit = useCallback((category) => {
    setEditingId(entityId(category))
    setDialogOpen(true)
  }, [])

  const handleDelete = useCallback(
    async (category) => {
      const confirmed = await confirm({
        title: t('categories.deleteTitle'),
        description: t('categories.deleteBody', { title: category.title }),
        confirmLabel: t('common.delete'),
      })
      if (!confirmed) return
      try {
        const res = await deleteCategory.mutateAsync(entityId(category))
        toastSuccess(
          res?.data?.deactivated ? t('categories.deactivated') : t('categories.deleted'),
        )
      } catch (error) {
        toastError(error, t)
      }
    },
    [confirm, deleteCategory, t],
  )

  const columns = useCategoryColumns({
    canEdit,
    canDelete,
    onEdit: handleEdit,
    onDelete: handleDelete,
  })

  const toolbar = canReadAll ? (
    <Select
      value={table.filters.status}
      onValueChange={(value) => table.setFilter('status', value)}
    >
      <SelectTrigger className="w-full sm:w-40" aria-label={t('categories.columns.status')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t('status.all')}</SelectItem>
        {STATUS_OPTIONS.map((status) => (
          <SelectItem key={status} value={status}>
            {t(`status.${status}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ) : null

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('categories.title')}
        description={t('categories.subtitle')}
        actions={
          canCreate ? (
            <Button onClick={handleCreate}>
              <Plus className="size-4" aria-hidden="true" />
              {t('categories.new')}
            </Button>
          ) : null
        }
      />

      <DataTable
        columns={columns}
        data={categories}
        isLoading={categoriesQuery.isLoading}
        isFetching={categoriesQuery.isFetching}
        error={categoriesQuery.isError ? categoriesQuery.error : null}
        onRetry={() => categoriesQuery.refetch()}
        search={{
          value: table.search,
          onChange: table.onSearchChange,
          placeholder: t('categories.searchPlaceholder'),
        }}
        toolbar={toolbar}
        sorting={table.sorting}
        onSortingChange={table.onSortingChange}
        pagination={table.pagination}
        onPaginationChange={table.onPaginationChange}
        manual
        total={categoriesQuery.data?.meta?.total}
        getRowId={(category) => entityId(category)}
        emptyMessage={t('categories.emptyBody')}
        caption={t('categories.title')}
      />

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editing}
      />

      {confirmEl}
    </div>
  )
}
