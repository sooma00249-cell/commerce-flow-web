import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
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
import { useCategories } from '@/features/categories/api'
import { useDeleteProduct, useProducts } from './api'
import { PRODUCT_STATUSES } from './schema'
import { useProductColumns } from './useProductColumns'

export default function ProductsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const hasPermission = useAuthStore((s) => s.hasPermission)

  const canCreate = hasPermission('products:create')
  const canEdit = hasPermission('products:update')
  const canDelete = hasPermission('products:delete')
  const canReadCost = hasPermission('products:readCost')
  const canReadAll = hasPermission('products:readAll')

  const table = useTableState({
    defaultSort: [{ id: 'createdAt', desc: true }],
    defaultFilters: { category: 'all', status: 'all' },
  })

  const productsQuery = useProducts(table.params)
  const categoriesQuery = useCategories({ status: 'all', limit: 100, sort: 'title' })
  const deleteProduct = useDeleteProduct()
  const [confirm, confirmEl] = useConfirm()

  const handleView = useCallback(
    (product) => navigate(`/products/${entityId(product)}`),
    [navigate],
  )
  const handleEdit = useCallback(
    (product) => navigate(`/products/${entityId(product)}/edit`),
    [navigate],
  )

  const handleDelete = useCallback(
    async (product) => {
      const confirmed = await confirm({
        title: t('products.deleteTitle'),
        description: t('products.deleteBody', { title: product.title }),
        confirmLabel: t('common.delete'),
      })
      if (!confirmed) return
      try {
        const res = await deleteProduct.mutateAsync(entityId(product))
        toastSuccess(res?.data?.deactivated ? t('products.deactivated') : t('products.deleted'))
      } catch (error) {
        toastError(error, t)
      }
    },
    [confirm, deleteProduct, t],
  )

  const columns = useProductColumns({
    locale: i18n.language,
    showCost: canReadCost,
    canEdit,
    canDelete,
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  })

  const categories = categoriesQuery.data?.items ?? []

  const toolbar = (
    <>
      <Select
        value={table.filters.category}
        onValueChange={(value) => table.setFilter('category', value)}
      >
        <SelectTrigger className="w-full sm:w-48" aria-label={t('products.fields.category')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('products.allCategories')}</SelectItem>
          {categories.map((category) => (
            <SelectItem key={entityId(category)} value={category.slug}>
              {category.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {canReadAll ? (
        <Select
          value={table.filters.status}
          onValueChange={(value) => table.setFilter('status', value)}
        >
          <SelectTrigger className="w-full sm:w-40" aria-label={t('products.columns.status')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('status.all')}</SelectItem>
            {PRODUCT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {t(`status.${status}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('products.title')}
        description={t('products.subtitle')}
        actions={
          canCreate ? (
            <Button onClick={() => navigate('/products/new')}>
              <Plus className="size-4" aria-hidden="true" />
              {t('products.new')}
            </Button>
          ) : null
        }
      />

      <DataTable
        columns={columns}
        data={productsQuery.data?.items ?? []}
        isLoading={productsQuery.isLoading}
        isFetching={productsQuery.isFetching}
        error={productsQuery.isError ? productsQuery.error : null}
        onRetry={() => productsQuery.refetch()}
        search={{
          value: table.search,
          onChange: table.onSearchChange,
          placeholder: t('products.searchPlaceholder'),
        }}
        toolbar={toolbar}
        sorting={table.sorting}
        onSortingChange={table.onSortingChange}
        pagination={table.pagination}
        onPaginationChange={table.onPaginationChange}
        manual
        total={productsQuery.data?.meta?.total}
        getRowId={(product) => entityId(product)}
        onRowClick={handleView}
        caption={t('products.title')}
      />

      {confirmEl}
    </div>
  )
}
