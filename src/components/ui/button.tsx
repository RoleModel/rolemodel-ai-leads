// components/ui/button.tsx
import * as React from 'react'

import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'ghost'
    | 'destructive'
    | 'icon'
    | 'ghosticon'
    | 'pill'
    | 'dashed'
    | 'dashedpill'
  size?: 'sm' | 'md' | 'lg'
  width?: 'full'
  justify?: 'start' | 'center' | 'end'
  href?: string
}

const dashedBorderStyle: React.CSSProperties = {
  border: '1px dashed var(--op-color-border)',
  boxShadow: 'none',
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      width = 'full-width',
      justify = 'center',
      className,
      ...props
    },
    ref
  ) => {
    const variantClass =
      {
        primary: 'btn btn--primary',
        secondary: 'btn',
        dashed: 'btn',
        dashedpill: 'btn btn--pill',
        ghost: 'btn btn--no-border',
        destructive: 'btn btn--destructive',
        icon: 'btn btn--icon btn--pill',
        ghosticon: 'btn btn--ghost btn--icon btn--no-border btn--pill',
        pill: 'btn btn--pill',
      }[variant] ?? 'btn'

    const sizeClass =
      {
        sm: 'btn--small',
        md: 'btn--medium',
        lg: 'btn--large',
      }[size] ?? 'btn--medium'

    const widthClass =
      {
        full: 'full-width',
      }[width] ?? undefined

    const justifyClass =
      {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
      }[justify] ?? undefined

    return (
      <button
        ref={ref}
        href={props.href}
        style={
          variant === 'dashed' || variant === 'dashedpill' ? dashedBorderStyle : undefined
        }
        className={cn(variantClass, sizeClass, widthClass, justifyClass, className)}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
