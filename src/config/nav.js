import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  ShoppingCart,
  ClipboardList,
  Boxes,
  BarChart3,
  Users,
} from 'lucide-react'

/**
 * Sidebar navigation. `permission` may be a string or an array (any-of).
 * Items are hidden when the signed-in user lacks the permission.
 */
export const navSections = [
  {
    key: 'overview',
    items: [{ key: 'dashboard', to: '/', icon: LayoutDashboard }],
  },
  {
    key: 'catalog',
    items: [
      { key: 'products', to: '/products', icon: Package, permission: 'products:read' },
      { key: 'categories', to: '/categories', icon: Tags, permission: 'categories:read' },
      { key: 'suppliers', to: '/suppliers', icon: Truck, permission: 'suppliers:read' },
    ],
  },
  {
    key: 'orders',
    items: [
      {
        key: 'saleOrders',
        to: '/sale-orders',
        icon: ShoppingCart,
        permission: ['saleOrders:readAll', 'saleOrders:create', 'saleOrders:updateStatus'],
      },
      {
        key: 'purchaseOrders',
        to: '/purchase-orders',
        icon: ClipboardList,
        permission: 'purchaseOrders:read',
      },
    ],
  },
  {
    key: 'operations',
    items: [
      { key: 'inventory', to: '/inventory', icon: Boxes, permission: 'inventory:read' },
      { key: 'reports', to: '/reports', icon: BarChart3, permission: 'reports:read' },
    ],
  },
  {
    key: 'administration',
    items: [{ key: 'users', to: '/users', icon: Users, permission: 'users:read' }],
  },
]

export function filterNavByPermissions(sections, hasPermission) {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.permission || hasPermission(item.permission)),
    }))
    .filter((section) => section.items.length > 0)
}
