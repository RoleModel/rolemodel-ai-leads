'use client'

import { RefreshIcon } from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'

import { ChatInterface } from '@/components/chat/ChatInterface'
import { Button } from '@/components/ui/button'

export function PlaygroundPreview() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          backgroundColor: 'var(--op-color-primary-base)',
          color: 'var(--op-color-primary-on-base)',
          padding: 'var(--op-space-medium) var(--op-space-large)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--op-space-small)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--op-radius-small)',
              backgroundColor: 'var(--op-color-primary-minus-four)',
              color: 'var(--op-color-primary-on-minus-four)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'var(--op-font-weight-bold)',
              fontSize: 'var(--op-font-medium)',
            }}
          >
            R
          </div>
          <span
            style={{
              fontWeight: 'var(--op-font-weight-medium)',
              fontSize: 'var(--op-font-medium)',
            }}
          >
            RoleModel Software
          </span>
        </div>
        <Button variant="ghosticon" onClick={() => {}}>
          <HugeiconsIcon
            icon={RefreshIcon}
            size={20}
            color="var(--op-color-primary-on-base)"
          />
        </Button>
      </div>

      {/* Chat Interface */}
      <div
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <ChatInterface initialMessage="Hi! Let's talk about your project!" />
      </div>
    </div>
  )
}
