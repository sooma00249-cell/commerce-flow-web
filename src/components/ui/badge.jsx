import { cn } from '@/lib/utils/cn'
import { badgeVariants } from './badge-variants'

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
