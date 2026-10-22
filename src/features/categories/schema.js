import { z } from 'zod'

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const categorySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'validation.required')
    .max(120, { error: 'validation.maxLength', max: 120 }),
  slug: z
    .string()
    .trim()
    .min(1, 'validation.required')
    .regex(SLUG_PATTERN, 'validation.slug'),
  description: z.string().optional(),
  isActive: z.boolean(),
  specKeys: z.array(z.string().trim().min(1)).default([]),
})

/** Turn arbitrary text into a slug-safe candidate (used by the "generate" hint). */
export function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function categoryDefaults(category) {
  if (!category) {
    return { title: '', slug: '', description: '', isActive: true, specKeys: [] }
  }
  return {
    title: category.title ?? '',
    slug: category.slug ?? '',
    description: category.description ?? '',
    isActive: category.isActive ?? true,
    specKeys: category.specKeys ?? [],
  }
}
