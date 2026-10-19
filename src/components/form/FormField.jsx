import { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Label + control + hint/error. Wires `aria-invalid` and `aria-describedby`
 * automatically so screen readers announce validation state.
 */
export function FormField({ label, htmlFor, hint, error, required, children, className }) {
  const hintId = htmlFor && hint ? `${htmlFor}-hint` : undefined
  const errorId = htmlFor && error ? `${htmlFor}-error` : undefined

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? (
          <span aria-hidden="true" className="ms-1 text-destructive">
            *
          </span>
        ) : null}
      </Label>
      {children}
      {hint && !error ? (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Ready-made text field. Spread `register('field')` from react-hook-form onto it
 * and pass `errors.field?.message` as `error`.
 */
export const TextField = forwardRef(function TextField(
  { label, error, hint, required, id, className, ...props },
  ref,
) {
  const inputId = id || props.name
  return (
    <FormField
      label={label}
      htmlFor={inputId}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <Input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
    </FormField>
  )
})

/** Non-field form error banner (bad credentials, server failure, …). */
export function FormError({ id, className, children }) {
  if (!children) return null
  return (
    <div
      id={id}
      role="alert"
      className={cn(
        'flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive',
        className,
      )}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}
