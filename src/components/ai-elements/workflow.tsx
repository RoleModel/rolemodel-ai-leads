'use client'

import { CheckIcon, ClockIcon, Loader2Icon, type LucideIcon } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { createContext, memo, useContext, useMemo } from 'react'

import { cn } from '@/lib/utils'

type WorkflowStatus = 'pending' | 'active' | 'complete' | 'error'

interface WorkflowContextValue {
  status: WorkflowStatus
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null)

export const useWorkflow = () => {
  const context = useContext(WorkflowContext)
  if (!context) {
    throw new Error('Workflow components must be used within a Workflow')
  }
  return context
}

export type WorkflowProps = ComponentProps<'div'> & {
  status?: WorkflowStatus
}

export const Workflow = memo(
  ({ children, className, status = 'pending', ...props }: WorkflowProps) => {
    const contextValue = useMemo(() => ({ status }), [status])

    return (
      <WorkflowContext.Provider value={contextValue}>
        <div
          className={cn('flex flex-col gap-3', className)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--op-space-medium)',
            padding: 'var(--op-space-medium)',
            backgroundColor: 'var(--op-color-neutral-plus-seven)',
            borderRadius: 'var(--op-radius-medium)',
            border: '1px solid var(--op-color-border)',
          }}
          {...props}
        >
          {children}
        </div>
      </WorkflowContext.Provider>
    )
  }
)

export type WorkflowNodeProps = ComponentProps<'div'> & {
  icon?: LucideIcon
  title: string
  description?: string
  status?: WorkflowStatus
  children?: ReactNode
}

export const WorkflowNode = memo(
  ({
    className,
    icon: Icon,
    title,
    description,
    status = 'pending',
    children,
    ...props
  }: WorkflowNodeProps) => {
    const StatusIcon = useMemo(() => {
      switch (status) {
        case 'complete':
          return CheckIcon
        case 'active':
          return Loader2Icon
        case 'error':
          return ClockIcon
        default:
          return Icon || ClockIcon
      }
    }, [status, Icon])

    const getStatusColor = () => {
      switch (status) {
        case 'complete':
          return 'var(--op-color-success-base)'
        case 'active':
          return 'var(--op-color-primary-base)'
        case 'error':
          return 'var(--op-color-error-base)'
        default:
          return 'var(--op-color-neutral-on-plus-max)'
      }
    }

    return (
      <div
        className={cn('flex gap-3', className)}
        style={{
          display: 'flex',
          gap: 'var(--op-space-medium)',
          alignItems: 'flex-start',
        }}
        {...props}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--op-radius-medium)',
            backgroundColor:
              status === 'active' || status === 'complete'
                ? getStatusColor()
                : 'var(--op-color-neutral-plus-six)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {StatusIcon && (
            <StatusIcon
              className={cn('h-4 w-4', status === 'active' && 'animate-spin')}
              style={{
                width: '16px',
                height: '16px',
                color:
                  status === 'active' || status === 'complete'
                    ? 'white'
                    : getStatusColor(),
              }}
            />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 'var(--op-font-small)',
              fontWeight: 600,
              color: getStatusColor(),
              marginBottom: description ? 'var(--op-space-2x-small)' : 0,
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                fontSize: 'var(--op-font-x-small)',
                color: 'var(--op-color-neutral-on-plus-max)',
                marginBottom: children ? 'var(--op-space-small)' : 0,
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

export type WorkflowEdgeProps = ComponentProps<'div'> & {
  active?: boolean
}

export const WorkflowEdge = memo(
  ({ className, active = false, ...props }: WorkflowEdgeProps) => (
    <div
      className={cn('relative', className)}
      style={{
        marginLeft: '16px',
        width: '2px',
        height: 'var(--op-space-large)',
        backgroundColor: active
          ? 'var(--op-color-primary-base)'
          : 'var(--op-color-border)',
        marginTop: 'calc(var(--op-space-small) * -1)',
        marginBottom: 'calc(var(--op-space-small) * -1)',
      }}
      {...props}
    />
  )
)

export type WorkflowResultProps = ComponentProps<'div'>

export const WorkflowResult = memo(
  ({ className, children, ...props }: WorkflowResultProps) => (
    <div
      className={cn('mt-2', className)}
      style={{
        marginTop: 'var(--op-space-small)',
        padding: 'var(--op-space-small)',
        backgroundColor: 'var(--op-color-neutral-plus-six)',
        borderRadius: 'var(--op-radius-small)',
        fontSize: 'var(--op-font-x-small)',
      }}
      {...props}
    >
      {children}
    </div>
  )
)

Workflow.displayName = 'Workflow'
WorkflowNode.displayName = 'WorkflowNode'
WorkflowEdge.displayName = 'WorkflowEdge'
WorkflowResult.displayName = 'WorkflowResult'
