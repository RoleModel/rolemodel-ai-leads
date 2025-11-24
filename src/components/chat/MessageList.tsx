'use client'

import type { UIMessage } from '@ai-sdk/react'
import { useEffect, useRef } from 'react'

import { MessageBubble } from './MessageBubble'

interface MessageListProps {
  messages: UIMessage[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--op-space-large)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--op-space-medium)',
      }}
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isLoading && (
        <MessageBubble
          message={
            {
              id: 'loading',
              role: 'assistant',
              content: '...',
            } as any
          }
          isLoading
        />
      )}

      <div ref={bottomRef} />
    </div>
  )
}
