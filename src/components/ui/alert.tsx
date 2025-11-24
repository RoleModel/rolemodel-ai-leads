import * as React from 'react'

import { cn } from '@/lib/utils'

function Alert({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & { variant?: 'default' | 'destructive' }) {
  const variantClass =
    {
      default: 'alert--info', // Mapping default to info as a safe fallback for standard alerts
      destructive: 'alert--danger',
    }[variant] ?? 'alert--info'

  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn('alert', variantClass, className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="alert-title" className={cn('alert__title', className)} {...props} />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn('alert__description', className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
