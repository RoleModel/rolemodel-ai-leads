'use client'

import { ArrowDownIcon } from 'lucide-react'
import type { ComponentProps } from 'react'
import { useCallback } from 'react'
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

export type ConversationProps = ComponentProps<typeof StickToBottom>

export const Conversation = ({ className, ...props }: ConversationProps) => (
  <StickToBottom
    style={{
      overscrollBehavior: 'contain',
      position: 'relative',
      flex: 1,
      overflowY: 'hidden',
    }}
    className={cn(className)}
    initial="smooth"
    resize="smooth"
    role="log"
    {...props}
  />
)

export type ConversationContentProps = ComponentProps<typeof StickToBottom.Content>

export const ConversationContent = ({
  className,
  ...props
}: ConversationContentProps) => (
  <StickToBottom.Content
    style={{
      gap: 'var(--op-space-small)',
      padding: 'var(--op-space-medium)',
      // maxHeight: '500px',
    }}
    className={cn('flex flex-col', className)}
    {...props}
  />
)

export type ConversationEmptyStateProps = ComponentProps<'div'> & {
  title?: string
  description?: string
  icon?: React.ReactNode
}

export const ConversationEmptyState = ({
  className,
  title = 'No messages yet',
  description = 'Start a conversation to see messages here',
  icon,
  children,
  ...props
}: ConversationEmptyStateProps) => (
  <div
    style={{
      justifyContent: 'center',
      gap: 'var(--op-space-large)',
      padding: 'var(--op-space-medium)',
      textAlign: 'center',
    }}
    className={cn('flex size-full flex-col items-center justify-center', className)}
    {...props}
  >
    {children ?? (
      <>
        {icon && (
          <div
            style={{
              color: 'var(--op-color-on-background)',
            }}
          >
            {icon}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--op-space-small)',
          }}
        >
          <h3
            style={{
              fontWeight: 500,
              fontSize: 'var(--op-font-small)',
            }}
          >
            {title}
          </h3>
          {description && (
            <p
              style={{
                color: 'var(--op-color-muted-foreground)',
                fontSize: 'var(--op-font-small)',
              }}
            >
              {description}
            </p>
          )}
        </div>
      </>
    )}
  </div>
)

export type ConversationScrollButtonProps = ComponentProps<typeof Button>

export const ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext()

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom()
  }, [scrollToBottom])

  return (
    !isAtBottom && (
      <Button
        style={{
          position: 'absolute',
          bottom: 'var(--op-space-medium)',
          left: '50%',
          transform: 'translateX(-50%)',
          borderRadius: 'var(--op-radius-full)',
        }}
        className={cn(
          'absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full',
          className
        )}
        onClick={handleScrollToBottom}
        size="sm"
        type="button"
        variant="secondary"
        {...props}
      >
        <ArrowDownIcon className="size-4" />
      </Button>
    )
  )
}
