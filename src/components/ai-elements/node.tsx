import { Handle, Position } from '@xyflow/react'
import type { ComponentProps } from 'react'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

export type NodeProps = ComponentProps<typeof Card> & {
  handles: {
    target: boolean
    source: boolean
  }
}

export const Node = ({ handles, className, ...props }: NodeProps) => (
  <Card
    style={{
      width: '100%',
      height: 'auto',
      gap: 0,
      padding: 0,
      borderRadius: 'var(--op-radius-medium)',
      boxShadow: 'var(--op-border-all) var(--op-color-neutral-plus-three)',
      position: 'relative',
      overflow: 'visible',
    }}
    className={cn(
      'node-container',
      className
    )}
    {...props}
  >
    {handles.target && <Handle position={Position.Left} type="target" />}
    {handles.source && <Handle position={Position.Right} type="source" />}
    {props.children}
  </Card>
)

export type NodeHeaderProps = ComponentProps<typeof CardHeader>

export const NodeHeader = ({ className, ...props }: NodeHeaderProps) => (
  <CardHeader
    style={{
      fontSize: 'var(--op-font-small)',
      fontWeight: 400,
      color: 'var(--op-color-neutral-on-plus-max)',
      marginBottom: 0,
      borderRadius: 'var(--op-radius-medium)',
      backgroundColor: 'var(--op-color-neutral-plus-seven)',
      padding: 'var(--op-space-x-small)',
    }}
    className={cn('gap-0.5', className)}
    {...props}
  />
)

export type NodeTitleProps = ComponentProps<typeof CardTitle>

export const NodeTitle = (props: NodeTitleProps) => <CardTitle {...props} />

export type NodeDescriptionProps = ComponentProps<typeof CardDescription>

export const NodeDescription = (props: NodeDescriptionProps) => (
  <CardDescription {...props} />
)

export type NodeActionProps = ComponentProps<typeof CardAction>

export const NodeAction = (props: NodeActionProps) => <CardAction {...props} />

export type NodeContentProps = ComponentProps<typeof CardContent>

export const NodeContent = ({ className, ...props }: NodeContentProps) => (
  <CardContent
    style={{
      padding: 'var(--op-space-x-small)',
    }}
    className={cn(className)}
    {...props}
  />
)

export type NodeFooterProps = ComponentProps<typeof CardFooter>

export const NodeFooter = ({ className, ...props }: NodeFooterProps) => (
  <CardFooter
    className={cn('rounded-b-md border-t bg-secondary p-3!', className)}
    {...props}
  />
)
