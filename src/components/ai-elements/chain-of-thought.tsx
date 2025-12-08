'use client'

import { ArrowDown01Icon, BrainIcon } from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import { useControllableState } from '@radix-ui/react-use-controllable-state'
import { DotIcon, type LucideIcon } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { createContext, memo, useContext, useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

import { cn } from '@/lib/utils'

type ChainOfThoughtContextValue = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const ChainOfThoughtContext = createContext<ChainOfThoughtContextValue | null>(null)

const useChainOfThought = () => {
  const context = useContext(ChainOfThoughtContext)
  if (!context) {
    throw new Error('ChainOfThought components must be used within ChainOfThought')
  }
  return context
}

export type ChainOfThoughtProps = ComponentProps<'div'> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export const ChainOfThought = memo(
  ({
    className,
    open,
    defaultOpen = false,
    onOpenChange,
    children,
    ...props
  }: ChainOfThoughtProps) => {
    const [isOpen, setIsOpen] = useControllableState({
      prop: open,
      defaultProp: defaultOpen,
      onChange: onOpenChange,
    })

    const chainOfThoughtContext = useMemo(
      () => ({ isOpen, setIsOpen }),
      [isOpen, setIsOpen]
    )

    return (
      <ChainOfThoughtContext.Provider value={chainOfThoughtContext}>
        <div className={cn('not-prose max-w-prose space-y-4', className)} {...props}>
          {children}
        </div>
      </ChainOfThoughtContext.Provider>
    )
  }
)

export type ChainOfThoughtHeaderProps = ComponentProps<typeof CollapsibleTrigger>

export const ChainOfThoughtHeader = memo(
  ({ children, ...props }: ChainOfThoughtHeaderProps) => {
    const { isOpen, setIsOpen } = useChainOfThought()

    return (
      <Collapsible onOpenChange={setIsOpen} open={isOpen}>
        <CollapsibleTrigger
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            gap: 'var(--op-space-small)',
            fontSize: 'var(--op-font-small)',
            color: 'var(--op-color-neutral-on-plus-max)',
            transition: 'color 0.2s',
          }}
          {...props}
        >
          <HugeiconsIcon icon={BrainIcon} size={20} />
          <span
            style={{
              textAlign: 'left',
              flex: 1,
            }}
            className="flex-1 text-left"
          >
            {children ?? 'Chain of Thought'}
          </span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={20}
            style={{
              transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s',
            }}
          />
        </CollapsibleTrigger>
      </Collapsible>
    )
  }
)

export type ChainOfThoughtStepProps = ComponentProps<'div'> & {
  icon?: LucideIcon
  label: ReactNode
  description?: ReactNode
  status?: 'complete' | 'active' | 'pending'
}

export const ChainOfThoughtStep = memo(
  ({
    className,
    icon: Icon = DotIcon,
    label,
    description,
    status = 'complete',
    children,
    ...props
  }: ChainOfThoughtStepProps) => {
    const statusStyles = {
      complete: 'var(--op-color-neutral-on-plus-severn)',
      active: 'var(--op-color-alerts-notice-minus-two)',
      pending: 'var(--op-color-neutral-on-plus-max)',
    }

    return (
      <div
        style={{
          color: statusStyles[status],
          display: 'flex',
          fontSize: 'var(--op-font-small)',
          gap: 'var(--op-space-x-small)',
          marginTop: 'var(--op-space-x-small)',
        }}
        className={cn(
          'flex gap-2',
          statusStyles[status],
          'fade-in-0 slide-in-from-top-2 animate-in',
          className
        )}
        {...props}
      >
        <div>
          <Icon className="size-4" style={{ height: '20px', width: '20px' }} />
        </div>
        <div
          style={{
            fontSize: 'var(--op-font-small)',
            display: 'flex',
            flex: 1,
            gap: 'var(--op-space-small)',
          }}
          className="flex-1 space-y-2"
        >
          <div
            style={{
              fontSize: 'var(--op-font-small)',
            }}
          >
            {label}
          </div>
          {description && (
            <div
              style={{
                fontSize: 'var(--op-font-small)',
                color: 'var(--op-color-neutral-on-plus-max)',
              }}
            >
              {description}
            </div>
          )}
          {children}
        </div>
      </div>
    )
  }
)

export type ChainOfThoughtSearchResultsProps = ComponentProps<'div'>

export const ChainOfThoughtSearchResults = memo(
  ({ className, ...props }: ChainOfThoughtSearchResultsProps) => (
    <div className={cn('flex items-center gap-2', className)} {...props} />
  )
)

export type ChainOfThoughtSearchResultProps = ComponentProps<typeof Badge>

export const ChainOfThoughtSearchResult = memo(
  ({ className, children, ...props }: ChainOfThoughtSearchResultProps) => (
    <Badge
      className={cn('gap-1 px-2 py-0.5 font-normal text-xs', className)}
      variant="secondary"
      {...props}
    >
      {children}
    </Badge>
  )
)

export type ChainOfThoughtContentProps = ComponentProps<typeof CollapsibleContent>

export const ChainOfThoughtContent = memo(
  ({ className, children, ...props }: ChainOfThoughtContentProps) => {
    const { isOpen } = useChainOfThought()

    return (
      <Collapsible open={isOpen}>
        <CollapsibleContent
          className={cn(
            'mt-2 space-y-3',
            'data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=open]:animate-in',
            className
          )}
          {...props}
        >
          {children}
        </CollapsibleContent>
      </Collapsible>
    )
  }
)

export type ChainOfThoughtImageProps = ComponentProps<'div'> & {
  caption?: string
}

export const ChainOfThoughtImage = memo(
  ({ className, children, caption, ...props }: ChainOfThoughtImageProps) => (
    <div className={cn('mt-2 space-y-2', className)} {...props}>
      <div className="relative flex max-h-[22rem] items-center justify-center overflow-hidden rounded-lg bg-muted p-3">
        {children}
      </div>
      {caption && <p className="text-muted-foreground text-xs">{caption}</p>}
    </div>
  )
)

ChainOfThought.displayName = 'ChainOfThought'
ChainOfThoughtHeader.displayName = 'ChainOfThoughtHeader'
ChainOfThoughtStep.displayName = 'ChainOfThoughtStep'
ChainOfThoughtSearchResults.displayName = 'ChainOfThoughtSearchResults'
ChainOfThoughtSearchResult.displayName = 'ChainOfThoughtSearchResult'
ChainOfThoughtContent.displayName = 'ChainOfThoughtContent'
ChainOfThoughtImage.displayName = 'ChainOfThoughtImage'
