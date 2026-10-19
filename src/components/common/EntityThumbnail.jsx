import { Package, Tag } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const FALLBACK_ICON = {
  product: Package,
  category: Tag,
}

/** Small square image with an icon fallback, for table rows and cards. */
export function EntityThumbnail({ src, alt = '', kind = 'product', className }) {
  if (!src) {
    const Icon = FALLBACK_ICON[kind] || Package
    return (
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground',
          className,
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn('size-9 shrink-0 rounded-md border bg-muted object-cover', className)}
    />
  )
}
