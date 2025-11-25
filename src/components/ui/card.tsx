import * as React from 'react'

import { cn } from '@/lib/utils'

interface CardHeaderProps extends React.ComponentProps<'div'> {
  border?: boolean;
}

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn('card card-padded flex flex-col gap-lg', className)}
      {...props}
    />
  )
}

function CardHeader({ className, border = false, ...props }: CardHeaderProps) {
  return (
    <div data-slot="card-header"
      style={{
        fontSize: 'var(--op-font-medium)',
        borderBottom: border ? '1px solid var(--op-color-border)' : 'none',
      }}
      className={cn('card__header', className)} {...props} />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-title" className={cn('card-title', className)} {...props} />
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
