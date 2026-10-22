import { z } from 'zod'
import { ADDRESS_KEYS } from '@/lib/address'

export { ADDRESS_KEYS }

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

const addressSchema = z.object({
  street: z.string().trim().max(200, { error: 'validation.maxLength', max: 200 }),
  city: z.string().trim().max(100, { error: 'validation.maxLength', max: 100 }),
  state: z.string().trim().max(100, { error: 'validation.maxLength', max: 100 }),
  zipCode: z.string().trim().max(20, { error: 'validation.maxLength', max: 20 }),
  country: z.string().trim().max(100, { error: 'validation.maxLength', max: 100 }),
})

export const supplierSchema = z
  .object({
    name: z.string().trim().min(1, 'validation.required'),
    email: z.string().trim().min(1, 'validation.required').email('validation.email'),
    phone: phoneField,
    status: z.enum(SUPPLIER_STATUSES),
    hasAddress: z.boolean(),
    address: addressSchema.optional(),
  })
  // The API rejects a partially filled address as a single error on the
  // `address` object, which would be invisible next to the inputs. Requiring
  // every key here keeps the message on the field that is actually missing.
  .superRefine((values, ctx) => {
    if (!values.hasAddress) return
    for (const key of ADDRESS_KEYS) {
      if (!String(values.address?.[key] ?? '').trim()) {
        ctx.addIssue({ code: 'custom', path: ['address', key], message: 'validation.required' })
      }
    }
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
