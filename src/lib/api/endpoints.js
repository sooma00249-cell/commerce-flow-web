import { apiRequest, get, post, patch, del } from './client'

/** Query-key factory — keep every cache key in one place per feature. */
export const queryKeys = {
  me: ['auth', 'me'],
  dashboard: (params) => ['reports', 'dashboard', params],
  products: (params) => ['products', params],
  product: (id) => ['products', 'detail', id],
  categories: (params) => ['categories', params],
  category: (id) => ['categories', 'detail', id],
  suppliers: (params) => ['suppliers', params],
  supplier: (id) => ['suppliers', 'detail', id],
  users: (params) => ['users', params],
  user: (id) => ['users', 'detail', id],
  saleOrders: (params) => ['sale-orders', params],
  saleOrder: (id) => ['sale-orders', 'detail', id],
  purchaseOrders: (params) => ['purchase-orders', params],
  inventory: (params) => ['inventory', params],
}

export const authApi = {
  me: () => apiRequest('/auth/me'),
  login: (credentials) => post('/auth/login', credentials),
  register: (data) => post('/auth/register', data),
  logout: () => post('/auth/logout'),
}

export const healthApi = {
  /** Liveness probe — lives at the backend root, not under `/api`. */
  check: () => get('/health', { absolute: true }),
}

export const productApi = {
  list: (query) => get('/products', { query }),
  getById: (id) => get(`/products/${id}`),
  getBySku: (sku) => get(`/products/sku/${encodeURIComponent(sku)}`),
  create: (data) => post('/products', data),
  update: (id, data) => patch(`/products/${id}`, data),
  remove: (id) => del(`/products/${id}`),
  uploadImages: (id, formData) => patch(`/products/${id}/images`, formData),
  deleteImage: (id, filename) => del(`/products/${id}/images/${filename}`),
}

export const categoryApi = {
  list: (query) => get('/categories', { query }),
  getById: (id) => get(`/categories/${id}`),
  getBySlug: (slug) => get(`/categories/slug/${encodeURIComponent(slug)}`),
  create: (data) => post('/categories', data),
  update: (id, data) => patch(`/categories/${id}`, data),
  remove: (id) => del(`/categories/${id}`),
  uploadImage: (id, formData) => patch(`/categories/${id}/image`, formData),
  deleteImage: (id) => del(`/categories/${id}/image`),
}

export const supplierApi = {
  list: (query) => get('/suppliers', { query }),
  getById: (id) => get(`/suppliers/${id}`),
  create: (data) => post('/suppliers', data),
  update: (id, data) => patch(`/suppliers/${id}`, data),
  remove: (id) => del(`/suppliers/${id}`),
}

export const userApi = {
  list: (query) => get('/users', { query }),
  getById: (id) => get(`/users/${id}`),
  create: (data) => post('/users', data),
  updateRoleStatus: (id, data) => patch(`/users/${id}/role-status`, data),
  profile: () => get('/users/profile/me'),
  updateProfile: (data) => patch('/users/profile/me', data),
  changePassword: (data) => patch('/users/profile/password', data),
  uploadAvatar: (formData) => patch('/users/profile/avatar', formData),
  deleteAvatar: () => del('/users/profile/avatar'),
}

export const saleOrderApi = {
  list: (query) => get('/sale-orders', { query }),
  getById: (id) => get(`/sale-orders/${id}`),
  create: (data) => post('/sale-orders', data),
  updateStatus: (id, status) => patch(`/sale-orders/${id}/status`, { status }),
}

export const purchaseOrderApi = {
  list: (query) => get('/purchase-orders', { query }),
  create: (data) => post('/purchase-orders', data),
  updateStatus: (id, status) => patch(`/purchase-orders/${id}/status`, { status }),
}

export const inventoryApi = {
  list: (query) => get('/inventory', { query }),
  adjust: (data) => post('/inventory/adjust', data),
}

export const reportApi = {
  dashboard: (query) => get('/reports/dashboard', { query }),
  sales: (query) => get('/reports/sales', { query }),
  purchases: (query) => get('/reports/purchases', { query }),
  products: (query) => get('/reports/products', { query }),
  users: (query) => get('/reports/users', { query }),
  customers: (query) => get('/reports/customers', { query }),
  inventory: (query) => get('/reports/inventory', { query }),
  exportPath: (name) => `/reports/${name}`,
}
