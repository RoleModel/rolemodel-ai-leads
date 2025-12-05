'use client'

import { ArrowUp01Icon } from 'hugeicons-react'
import { ChangeEvent, FormEvent, useRef } from 'react'

interface ChatInputProps {
  input: string
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void
  isLoading: boolean
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: ChatInputProps) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <div
      style={{
        padding: 'var(--op-space-large)',
        borderTop: '1px solid var(--op-color-border)',
        backgroundColor: 'var(--op-color-background)',
      }}
    >
      <form ref={formRef} onSubmit={handleSubmit}>
        <div
          style={{
            display: 'flex',
            gap: 'var(--op-space-small)',
            alignItems: 'flex-end',
          }}
        >
          <textarea
            id="chat-input-message"
            className="form-control"
            value={input || ''}
            onChange={handleInputChange}
            placeholder="Type your message..."
            rows={1}
            disabled={isLoading}
            style={{
              flex: 1,
              resize: 'none',
              minHeight: 'var(--op-input-height-large)',
              maxHeight: '120px',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                formRef.current?.requestSubmit()
              }
            }}
            aria-label="Type your message"
          />

          <button
            type="submit"
            className="btn btn--primary btn--icon btn--large"
            disabled={isLoading || !input?.trim()}
            style={{
              flexShrink: 0,
            }}
            aria-label="Send message"
          >
            <ArrowUp01Icon className="icon-sm" />
          </button>
        </div>
      </form>
    </div>
  )
}
