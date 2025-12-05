'use client'

import { forwardRef, type ComponentProps } from 'react'

import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

import { cn } from '@/lib/utils'

export type SuggestionsProps = ComponentProps<typeof ScrollArea>

export const Suggestions = ({ className, children, ...props }: SuggestionsProps) => (
  <ScrollArea className="w-full overflow-x-auto whitespace-nowrap" {...props}>
    <div
      style={{ display: 'flex', width: 'max-content', flexWrap: 'nowrap', alignItems: 'center', gap: 'var(--op-space-medium)' }}
      className={cn(className)}>
      {children}
    </div>
    <ScrollBar className="hidden" orientation="horizontal" />
  </ScrollArea>
)

export type SuggestionProps = Omit<ComponentProps<typeof Button>, 'onClick'> & {
  suggestion: string
  onClick?: (suggestion: string) => void
}

export const Suggestion = forwardRef<HTMLButtonElement, SuggestionProps>(
  ({ suggestion, onClick, className, variant = 'pill', size = 'sm', children, ...props }, ref) => {
    const handleClick = () => {
      onClick?.(suggestion)
    }

    return (
      <Button
        ref={ref}
        style={{ paddingInline: 'var(--op-space-medium)' }}
        className={cn('cursor-pointer', className)}
        onClick={handleClick}
        size={size}
        type="button"
        variant={variant}
        {...props}
      >
        {children || suggestion}
      </Button>
    )
  }
)

Suggestion.displayName = 'Suggestion'
