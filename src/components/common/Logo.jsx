import { Boxes } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function Logo({ className, showText = true }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-semibold', className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Boxes className="size-5" aria-hidden="true" />
      </span>
      {showText ? <span className="text-base tracking-tight">Commerce Flow</span> : null}
    </span>
  )
}
