import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { RequireAuth } from '@/components/common/RequireAuth'
import { RequirePermission } from '@/components/common/RequirePermission'
import { navSections } from '@/config/nav'
import LoginPage from '@/features/auth/LoginPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import ProductsPage from '@/features/products/ProductsPage'
import ProductFormPage from '@/features/products/ProductFormPage'
import ProductDetailPage from '@/features/products/ProductDetailPage'
import CategoriesPage from '@/features/categories/CategoriesPage'
import SuppliersPage from '@/features/suppliers/SuppliersPage'
import SaleOrdersPage from '@/features/orders/SaleOrdersPage'
import SaleOrderFormPage from '@/features/orders/SaleOrderFormPage'
import SaleOrderDetailPage from '@/features/orders/SaleOrderDetailPage'
import PurchaseOrdersPage from '@/features/orders/PurchaseOrdersPage'
import PurchaseOrderFormPage from '@/features/orders/PurchaseOrderFormPage'
import PlaceholderPage from '@/features/misc/PlaceholderPage'
import NotFoundPage from '@/features/misc/NotFoundPage'

// Sections that are wired in the navigation but not implemented yet render a
// placeholder so the shell is fully navigable during early phases.
const implemented = new Set([
  '/',
  '/products',
  '/categories',
  '/suppliers',
  '/sale-orders',
  '/purchase-orders',
  '/profile',
])

const placeholderRoutes = navSections
  .flatMap((section) => section.items)
  .filter((item) => !implemented.has(item.to))
  .map((item) => ({
    path: item.to.replace(/^\//, ''),
    element: <PlaceholderPage titleKey={`nav.${item.key}`} />,
  }))

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'products',
        element: (
          <RequirePermission permission="products:read">
            <ProductsPage />
          </RequirePermission>
        ),
      },
      {
        path: 'products/new',
        element: (
          <RequirePermission permission="products:create">
            <ProductFormPage />
          </RequirePermission>
        ),
      },
      {
        path: 'products/:id',
        element: (
          <RequirePermission permission="products:read">
            <ProductDetailPage />
          </RequirePermission>
        ),
      },
      {
        path: 'products/:id/edit',
        element: (
          <RequirePermission permission="products:update">
            <ProductFormPage />
          </RequirePermission>
        ),
      },
      {
        path: 'categories',
        element: (
          <RequirePermission permission="categories:read">
            <CategoriesPage />
          </RequirePermission>
        ),
      },
      {
        path: 'suppliers',
        element: (
          <RequirePermission permission="suppliers:read">
            <SuppliersPage />
          </RequirePermission>
        ),
      },
      {
        path: 'sale-orders',
        element: (
          <RequirePermission permission={['saleOrders:readAll', 'saleOrders:create', 'saleOrders:updateStatus']}>
            <SaleOrdersPage />
          </RequirePermission>
        ),
      },
      {
        path: 'sale-orders/new',
        element: (
          <RequirePermission permission="saleOrders:create">
            <SaleOrderFormPage />
          </RequirePermission>
        ),
      },
      {
        path: 'sale-orders/:id',
        element: (
          <RequirePermission permission={['saleOrders:readAll', 'saleOrders:create', 'saleOrders:updateStatus']}>
            <SaleOrderDetailPage />
          </RequirePermission>
        ),
      },
      {
        path: 'purchase-orders',
        element: (
          <RequirePermission permission="purchaseOrders:read">
            <PurchaseOrdersPage />
          </RequirePermission>
        ),
      },
      {
        path: 'purchase-orders/new',
        element: (
          <RequirePermission permission="purchaseOrders:create">
            <PurchaseOrderFormPage />
          </RequirePermission>
        ),
      },
      { path: 'profile', element: <PlaceholderPage titleKey="nav.profile" /> },
      ...placeholderRoutes,
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
