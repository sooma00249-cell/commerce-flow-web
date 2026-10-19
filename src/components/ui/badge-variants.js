import { cva } from 'class-variance-authority'

/**
 * Tinted status pills. Colors come from the explicit Tailwind palette (rather
 * than the OKLCH tokens) so the text/background pair is guaranteed to clear
 * WCAG AA contrast in both themes.
 */
export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium leading-5 whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'text-foreground',
        muted: 'border-transparent bg-muted text-muted-foreground',
        success:
          'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
        warning:
          'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
        info: 'border-transparent bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
        destructive:
          'border-transparent bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)
