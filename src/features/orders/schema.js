import { z } from 'zod'
import { ADDRESS_LIMITS, emptyAddress } from '@/lib/address'

export const SALE_ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
export const PURCHASE_ORDER_STATUSES = ['draft', 'ordered', 'received', 'cancelled']

/**
 * Legal status transitions, mirroring the maps the API enforces
 * (`saleOrder.routes.js` / `purchaseOrder.routes.js`). The API answers 409 for
 * anything else, so the UI only ever offers the allowed targets.
 */
export const SALE_ORDER_TRANSITIONS = {
  pending: ['paid', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

export const PURCHASE_ORDER_TRANSITIONS = {
  draft: ['ordered', 'cancelled'],
  ordered: ['received', 'cancelled'],
  received: [],
  cancelled: [],
}

/** The only statuses a delivery agent (`saleOrders:updateDelivery`) may set. */
export const DELIVERY_STATUSES = ['shipped', 'delivered']

export const PAYMENT_METHODS = ['cod', 'stripe', 'card', 'paypal']

export const MAX_ORDER_ITEMS = 50

const requiredQuantity = z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? undefined : value),
  z.coerce
    .number({ error: 'validation.required' })
    .int('validation.integer')
    .min(1, { error: 'validation.min', min: 1 }),
)

const orderItemSchema = z.object({
  product: z.string().min(1, 'validation.required'),
  quantity: requiredQuantity,
})

const addressSchema = z.object({
  street: z
    .string()
    .trim()
    .min(1, 'validation.required')
    .max(ADDRESS_LIMITS.street, { error: 'validation.maxLength', max: ADDRESS_LIMITS.street }),
  city: z
    .string()
    .trim()
    .min(1, 'validation.required')
    .max(ADDRESS_LIMITS.city, { error: 'validation.maxLength', max: ADDRESS_LIMITS.city }),
  state: z
    .string()
    .trim()
    .min(1, 'validation.required')
    .max(ADDRESS_LIMITS.state, { error: 'validation.maxLength', max: ADDRESS_LIMITS.state }),
  zipCode: z
    .string()
    .trim()
    .min(1, 'validation.required')
    .max(ADDRESS_LIMITS.zipCode, { error: 'validation.maxLength', max: ADDRESS_LIMITS.zipCode }),
  country: z
    .string()
    .trim()
    .min(1, 'validation.required')
    .max(ADDRESS_LIMITS.country, { error: 'validation.maxLength', max: ADDRESS_LIMITS.country }),
})

export const saleOrderSchema = z.object({
  customer: z.string().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  address: addressSchema,
  items: z
    .array(orderItemSchema)
    .min(1, 'orders.itemsRequired')
    .max(MAX_ORDER_ITEMS, { error: 'validation.maxLength', max: MAX_ORDER_ITEMS }),
})

export const purchaseOrderSchema = z.object({
  supplier: z.string().min(1, 'validation.required'),
  expectedDeliveryDate: z.string().optional(),
  items: z
    .array(orderItemSchema)
    .min(1, 'orders.itemsRequired')
    .max(MAX_ORDER_ITEMS, { error: 'validation.maxLength', max: MAX_ORDER_ITEMS }),
})

export function saleOrderDefaults() {
  return {
    customer: '',
    paymentMethod: 'cod',
    address: emptyAddress(),
    items: [],
  }
}

export function purchaseOrderDefaults() {
  return {
    supplier: '',
    expectedDeliveryDate: '',
    items: [],
  }
}

function cleanAddress(address) {
  return {
    street: address.street.trim(),
    city: address.city.trim(),
    state: address.state.trim(),
    zipCode: address.zipCode.trim(),
    country: address.country.trim(),
  }
}

export function buildSaleOrderPayload(values) {
  const payload = {
    paymentMethod: values.paymentMethod,
    address: cleanAddress(values.address),
    items: values.items.map((item) => ({
      product: item.product,
      quantity: Number(item.quantity),
    })),
  }
  if (values.customer) payload.customer = values.customer
  return payload
}

export function buildPurchaseOrderPayload(values) {
  const payload = {
    supplier: values.supplier,
    items: values.items.map((item) => ({
      product: item.product,
      quantity: Number(item.quantity),
    })),
  }
  if (values.expectedDeliveryDate) {
    payload.expectedDeliveryDate = new Date(values.expectedDeliveryDate).toISOString()
  }
  return payload
}

/**
 * Statuses the current user may set on a sale order.
 *
 * `saleOrders:updateStatus` may drive the full lifecycle, `saleOrders:updateDelivery`
 * is limited to shipping milestones, and a plain customer may cancel their own
 * pending order — exactly what the API allows.
 */
export function allowedSaleOrderStatuses(order, { canUpdateStatus, canUpdateDelivery, isOwner }) {
  const allowed = SALE_ORDER_TRANSITIONS[order?.status] ?? []
  return allowed.filter((status) => {
    if (canUpdateStatus) return true
    if (canUpdateDelivery) return DELIVERY_STATUSES.includes(status)
    return isOwner && status === 'cancelled' && order.status === 'pending'
  })
}

/** Statuses the current user may set on a purchase order. */
export function allowedPurchaseOrderStatuses(order, { canUpdateStatus }) {
  if (!canUpdateStatus) return []
  return PURCHASE_ORDER_TRANSITIONS[order?.status] ?? []
}

/** Short, human-friendly reference for an order (last 6 chars of the id). */
export function orderReference(id) {
  return String(id ?? '').slice(-6).toUpperCase()
}
