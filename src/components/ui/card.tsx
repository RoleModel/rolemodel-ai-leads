import * as React from 'react'

import { cn } from '@/lib/utils'

interface CardHeaderProps extends React.ComponentProps<'div'> {
  border?: boolean
}

interface CardProps extends React.ComponentProps<'div'> {
  variant?: 'default' | 'dark'
  borderBottom?: string
}

function Card({
  className,
  variant = 'default',
  borderBottom,
  style,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        'card card-padded flex flex-col gap-lg',
        variant === 'dark' && 'card--dark',
        className
      )}
      style={{
        ...(variant === 'dark' && {
          backgroundColor: 'var(--blue-green-900)',
          color: 'var(--op-color-white)',
        }),
        ...(borderBottom && {
          borderBottom: `8px solid ${borderBottom}`,
        }),
        ...style,
      }}
      {...props}
    />
  )
}

function CardHeader({ className, border = false, ...props }: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      style={{
        fontSize: 'var(--op-font-medium)',
        borderBottom: border ? '1px solid var(--op-color-border)' : 'none',
      }}
      className={cn('card__header', className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      style={{
        fontSize: 'var(--op-font-x-small)',
      }}
      className={cn('card-title', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('card-description', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="card-action" className={cn('card-action', className)} {...props} />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="card-content" className={cn('card__body', className)} {...props} />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('card__footer flex items-center gap-sm', className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
