'use client'

import * as SelectPrimitive from '@radix-ui/react-select'
import { ArrowDown01Icon, ArrowUp01Icon, Tick01Icon } from 'hugeicons-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: 'sm' | 'default'
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      style={{
        border: '1px solid var(--op-color-border)',
        backgroundColor: 'var(--op-color-background)',
        color: 'var(--op-color-on-background)',
        borderRadius: 'var(--op-radius-medium)',
        padding: 'var(--op-space-small)',
        fontSize: 'var(--op-font-small)',
        fontWeight: 'var(--op-font-weight-medium)',
        lineHeight: 'var(--op-line-height-small)',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        outline: 'none',
        ...props.style,
      }}
      className={cn('form-control data-[size=default]:h-9 data-[size=sm]:h-8', className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ArrowDown01Icon
          className="icon-sm"
          style={{ height: '16px', width: '16px', opacity: 0.5 }}
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = 'popper',
  align = 'center',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        style={{
          backgroundColor: 'var(--op-color-background)',
          color: 'var(--op-color-on-background)',
          boxShadow: 'var(--op-shadow-medium)',
          borderRadius: 'var(--op-radius-medium)',
          padding: 'var(--op-space-x-small)',
          fontSize: 'var(--op-font-small)',
          fontWeight: 'var(--op-font-weight-medium)',
          lineHeight: 'var(--op-line-height-small)',
          position: 'relative',
          zIndex: 1000,
          minWidth: '200px',
          overflow: 'hidden',
          border: '1px solid var(--op-color-border)',
          gap: 'var(--op-space-x-small)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'stretch',
          width: '100%',
          height: '100%',
          outline: 'none',
          ...props.style,
        }}
        className={cn(
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          style={{
            padding: 'var(--op-space-x-small)',
            width: '100%',
            minWidth: 'var(--radix-select-trigger-width)',
            height: 'var(--radix-select-trigger-height)',
          }}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      style={{
        fontSize: 'var(--op-font-small)',
        fontWeight: 'var(--op-font-weight-medium)',
        lineHeight: 'var(--op-line-height-small)',
        color: 'var(--op-color-on-background)',
        padding: 'var(--op-space-x-small)',
      }}
      className={cn(className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      style={{
        padding: 'var(--op-space-2x-small)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        userSelect: 'none',
        outline: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ...props.style,
      }}
      className={cn('btn btn--small btn--no-border', className)}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Tick01Icon className="icon-sm" style={{ height: '16px', width: '16px' }} />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('-mx-1 my-1 h-px bg-muted', className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ArrowUp01Icon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ArrowDown01Icon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
