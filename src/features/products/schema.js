import { z } from 'zod'

export const PRODUCT_STATUSES = ['active', 'inactive', 'draft']
export const MAX_PRODUCT_IMAGES = 10

export const productSchema = z
  .object({
    title: z.string().trim().min(1, 'validation.required'),
    sku: z.string().trim().min(1, 'validation.required'),
    category: z.string().min(1, 'validation.required'),
    price: z.number({ error: 'validation.number' }).min(0, 'validation.positive'),
    costPrice: z.number({ error: 'validation.number' }).min(0, 'validation.positive'),
    lowStockThreshold: z
      .number({ error: 'validation.number' })
      .int('validation.integer')
      .min(0, 'validation.positive'),
    status: z.enum(PRODUCT_STATUSES),
    description: z.string().optional(),
    specifications: z.record(z.string(), z.string()).optional(),
  })
  .refine((values) => values.price > values.costPrice, {
    path: ['price'],
    message: 'validation.priceGreaterThanCost',
  })

export function productDefaults(product) {
  if (!product) {
    return {
      title: '',
      sku: '',
      category: '',
      price: '',
      costPrice: '',
      lowStockThreshold: 5,
      status: 'active',
      description: '',
      specifications: {},
    }
  }
  return {
    title: product.title ?? '',
    sku: product.sku ?? '',
    category: product.category?._id ?? product.category ?? '',
    price: product.price ?? '',
    costPrice: product.costPrice ?? '',
    lowStockThreshold: product.lowStockThreshold ?? 5,
    status: product.status ?? 'active',
    description: product.description ?? '',
    specifications: product.specifications ?? {},
  }
}

/** Keep only the specification keys the selected category allows. */
export function pickSpecifications(specifications, specKeys) {
  const source = specifications ?? {}
  const result = {}
  for (const key of specKeys) {
    const value = source[key]
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      result[key] = String(value).trim()
    }
  }
  return result
}

export function buildProductPayload(values, specKeys) {
  return {
    title: values.title,
    sku: values.sku,
    category: values.category,
    price: Number(values.price),
    costPrice: Number(values.costPrice),
    lowStockThreshold: Number(values.lowStockThreshold),
    status: values.status,
    description: values.description ?? '',
    specifications: pickSpecifications(values.specifications, specKeys),
  }
}
