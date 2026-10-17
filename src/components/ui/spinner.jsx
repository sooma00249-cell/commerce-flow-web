import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function Spinner({ className, ...props }) {
  return (
    <Loader2 className={cn('size-4 animate-spin', className)} aria-hidden="true" {...props} />
  )
}

export function FullPageLoader({ label }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-svh flex-col items-center justify-center gap-3 text-muted-foreground"
    >
      <Spinner className="size-6" />
      {label ? <span className="text-sm">{label}</span> : null}
    </div>
  )
}
