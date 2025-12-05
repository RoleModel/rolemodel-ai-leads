'use client'

import type { UIMessage } from 'ai'
import { useEffect, useRef } from 'react'

import { MessageBubble } from './MessageBubble'

interface MessageListProps {
  messages: UIMessage[]
  isLoading: boolean
}

const loadingMessage: UIMessage = {
  id: 'loading',
  role: 'assistant',
  parts: [{ type: 'text', text: '...' }],
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
        <MessageBubble message={loadingMessage} isLoading />
      )}

      <div ref={bottomRef} />
    </div>
  )
}
