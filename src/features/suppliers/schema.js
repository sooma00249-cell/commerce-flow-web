import { z } from 'zod'

export const SUPPLIER_STATUSES = ['active', 'inactive']

const PHONE_PATTERN = /^\+?\d{7,15}$/

/** Digits-only phone check (spaces, dashes, parens and dots are stripped). */
const phoneField = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || PHONE_PATTERN.test(value.replace(/[\s\-().]/g, '')), {
    message: 'validation.phone',
  })

export const supplierSchema = z.object({
  name: z.string().trim().min(1, 'validation.required'),
  email: z.string().trim().min(1, 'validation.required').email('validation.email'),
  phone: phoneField,
  status: z.enum(SUPPLIER_STATUSES),
  hasAddress: z.boolean(),
  address: z
    .object({
      street: z.string().trim().max(200, 'validation.maxLength'),
      city: z.string().trim().max(100, 'validation.maxLength'),
      state: z.string().trim().max(100, 'validation.maxLength'),
      zipCode: z.string().trim().max(20, 'validation.maxLength'),
      country: z.string().trim().max(100, 'validation.maxLength'),
    })
    .optional(),
})

const EMPTY_ADDRESS = { street: '', city: '', state: '', zipCode: '', country: '' }

export function supplierDefaults(supplier) {
  if (!supplier) {
    return {
      name: '',
      email: '',
      phone: '',
      status: 'active',
      hasAddress: false,
      address: EMPTY_ADDRESS,
    }
  }
  const address = supplier.address ?? EMPTY_ADDRESS
  return {
    name: supplier.name ?? '',
    email: supplier.email ?? '',
    phone: supplier.phone ?? '',
    status: supplier.status ?? 'active',
    hasAddress: Boolean(supplier.address?.street),
    address: { ...EMPTY_ADDRESS, ...address },
  }
}

export function buildSupplierPayload(values, { includeStatus }) {
  const payload = {
    name: values.name,
    email: values.email,
    phone: values.phone?.trim() ? values.phone.trim() : undefined,
  }
  if (includeStatus) payload.status = values.status
  if (values.hasAddress) {
    payload.address = {
      street: values.address.street.trim(),
      city: values.address.city.trim(),
      state: values.address.state.trim(),
      zipCode: values.address.zipCode.trim(),
      country: values.address.country.trim(),
    }
  }
  return payload
}
