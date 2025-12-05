'use client'

import { type UIMessage, isTextUIPart } from 'ai'

interface MessageBubbleProps {
  message: UIMessage
  isLoading?: boolean
}

export function MessageBubble({ message, isLoading }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const textParts = message.parts.filter(isTextUIPart)
  const content = textParts.map((part) => part.text).join('\n')

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        width: '100%',
      }}
    >
      <div
        className={
          isUser
            ? 'message-bubble message-bubble--user'
            : 'message-bubble message-bubble--assistant'
        }
        style={{
          maxWidth: '70%',
          padding: 'var(--op-space-small) var(--op-space-medium)',
          borderRadius: 'var(--op-radius-medium)',
          backgroundColor: isUser
            ? 'var(--op-color-primary-base)'
            : 'var(--op-color-neutral-plus-eight)',
          color: isUser
            ? 'var(--op-color-primary-on-base)'
            : 'var(--op-color-neutral-on-plus-eight)',
          fontSize: 'var(--op-font-small)',
          lineHeight: 'var(--op-line-height-base)',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        }}
      >
        {isLoading ? (
          <span className="loading-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        ) : (
          content
        )}
      </div>
    </div>
  )
}
