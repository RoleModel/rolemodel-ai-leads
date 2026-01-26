'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const groupBaseStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  minHeight: 36,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'var(--op-color-border)',
  borderRadius: 'var(--op-radius-large)',
  backgroundColor: 'var(--op-color-background)',
  boxShadow: 'var(--op-shadow-small)',
  transition: 'border-color 150ms ease, box-shadow 150ms ease',
}

const groupDirectionStyles: Record<'column' | 'row', React.CSSProperties> = {
  column: {
    flexDirection: 'column' as const,
  },
  row: {
    flexDirection: 'row' as const,
  },
}

const addonBaseStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--op-space-x-small)',
  fontSize: 'var(--op-font-small)',
  color: 'var(--op-color-neutral-plus-max)',
  lineHeight: 1,
  padding: '6px 10px',
  cursor: 'text',
  userSelect: 'none',
}

const addonAlignStyles: Record<
  'inline-start' | 'inline-end' | 'block-start' | 'block-end',
  React.CSSProperties
> = {
  'inline-start': {
    order: 0,
    paddingLeft: 'var(--op-space-small)',
  },
  'inline-end': {
    order: 2,
    paddingRight: 'var(--op-space-small)',
  },
  'block-start': {
    order: 0,
    width: '100%',
    justifyContent: 'flex-start',
    borderBottom: '1px solid var(--op-color-border)',
    padding: 'var(--op-space-small)',
  },
  'block-end': {
    order: 3,
    width: '100%',
    borderTop: '1px solid ',
    borderColor: 'inherit',
    padding: 'var(--op-space-small)',
  },
}
const addonDirectionStyles: Record<'column' | 'row', React.CSSProperties> = {
  column: {
    flexDirection: 'column' as const,
  },
  row: {
    flexDirection: 'row' as const,
  },
}

const buttonSizeStyles: Record<'xs' | 'sm' | 'icon-xs' | 'icon-sm', React.CSSProperties> =
  {
    xs: {
      minHeight: 24,
      paddingInline: 'var(--op-space-x-small)',
    },
    sm: {
      minHeight: 32,
      paddingInline: 'var(--op-space-small)',
    },
    'icon-xs': {
      minHeight: 24,
      minWidth: 32,
      padding: 0,
    },
    'icon-sm': {
      minHeight: 32,
      minWidth: 36,
      padding: 0,
    },
  }

const controlBaseStyle: React.CSSProperties = {
  flex: 1,
  border: 'none',
  background: 'transparent',
  boxShadow: 'none',
  padding: '6px 10px',
  fontSize: 'var(--op-font-small)',
}

function InputGroup({
  className,
  style,
  direction = 'row' as const,
  ...props
}: React.ComponentProps<'div'> & {
  direction?: 'column' | 'row'
}) {
  const [hasFocus, setHasFocus] = React.useState(false)

  const mergedStyle: React.CSSProperties = {
    ...groupBaseStyle,
    ...groupDirectionStyles[direction],
    ...(hasFocus && {
      backgroundColor: 'var(--op-color-primary-plus-seven)',
      boxShadow: 'var(--op-input-focus-primary)',
      borderColor: 'var(--op-color-primary-plus-three)',
    }),
    ...style,
  }

  return (
    <div
      data-slot="input-group"
      role="group"
      className={className}
      style={mergedStyle}
      onFocusCapture={() => setHasFocus(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHasFocus(false)
        }
      }}
      {...props}
    />
  )
}

function InputGroupAddon({
  className,
  style,
  align = 'inline-start' as const,
  direction = 'row' as const,
  ...props
}: React.ComponentProps<'div'> & {
  align?: 'inline-start' | 'inline-end' | 'block-start' | 'block-end'
  direction?: 'column' | 'row'
}) {
  const mergedStyle: React.CSSProperties = {
    ...addonBaseStyle,
    ...addonAlignStyles[align],
    ...addonDirectionStyles[direction],
    ...style,
  }

  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={className}
      style={mergedStyle}
      onMouseDown={(event) => {
        const target = event.currentTarget.parentElement
        const control = target?.querySelector<HTMLInputElement>(
          '[data-slot="input-group-control"]'
        )
        control?.focus()
      }}
      {...props}
    />
  )
}

const InputGroupButton = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentProps<typeof Button>, 'size'> & {
    size?: 'xs' | 'sm' | 'icon-xs' | 'icon-sm'
  }
>(
  (
    { className, style, type = 'button', variant = 'ghost', size = 'xs', ...props },
    ref
  ) => {
    const mergedStyle = {
      ...buttonSizeStyles[size],
      ...style,
    }

    return (
      <Button
        ref={ref}
        type={type}
        variant={variant}
        className={className}
        style={mergedStyle}
        {...props}
      />
    )
  }
)
InputGroupButton.displayName = 'InputGroupButton'

function InputGroupText({ className, style, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--op-space-x-small)',
        fontSize: 'var(--op-font-small)',
        color: 'var(--op-color-neutral-plus-max)',
        ...(style ?? {}),
      }}
      {...props}
    />
  )
}

function InputGroupInput({ className, style, ...props }: React.ComponentProps<'input'>) {
  return (
    <Input
      data-slot="input-group-control"
      className={className}
      style={{
        ...controlBaseStyle,
        ...(style ?? {}),
      }}
      {...props}
    />
  )
}

const InputGroupTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, style, ...props }, ref) => {
  return (
    <Textarea
      ref={ref}
      data-slot="input-group-control"
      className={className}
      style={{
        ...controlBaseStyle,
        resize: 'none',
        minHeight: 64,
        paddingTop: 'var(--op-space-small)',
        paddingBottom: 'var(--op-space-small)',
        ...(style ?? {}),
      }}
      {...props}
    />
  )
})
InputGroupTextarea.displayName = 'InputGroupTextarea'

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
