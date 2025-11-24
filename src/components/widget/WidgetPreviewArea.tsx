'use client'
import { Cancel01Icon, RefreshIcon } from '@hugeicons-pro/core-stroke-standard'
import { ChatBotIcon } from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

import { ChatInterface } from '@/components/chat/ChatInterface'
import { Button } from '@/components/ui/button'

import { useWidgetConfig } from '@/contexts/WidgetConfigContext'

export function WidgetPreviewArea() {
  const { config } = useWidgetConfig()
  const [isOpen, setIsOpen] = useState(true)
  const [showNotice, setShowNotice] = useState(true)

  const styles = {
    grid: {
      position: 'absolute' as const,
      inset: 0,
      backgroundImage:
        'radial-gradient(var(--op-color-neutral-plus-four) 1px, transparent 0)',
      backgroundSize: '10px 10px',
      pointerEvents: 'none' as const,
      zIndex: 0,
    },
  }

  return (
    <main
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: 'var(--op-color-background)',
        position: 'relative',
      }}
    >
      {/* Preview Header */}
      <div
        style={{
          padding: 'var(--op-space-medium) var(--op-space-large)',
          borderBottom: '1px solid var(--op-color-border)',
          backgroundColor: 'var(--op-color-background)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 'var(--op-font-medium)',
              fontWeight: 'var(--op-font-weight-medium)',
              margin: 0,
            }}
          >
            Widget Preview
          </h2>
          <p
            style={{
              fontSize: 'var(--op-font-x-small)',
              margin: '0',
            }}
          >
            This is how the widget will appear.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--op-space-small)' }}>
          <button className="btn btn--ghost btn--icon">
            <HugeiconsIcon icon={RefreshIcon} size={20} />
          </button>
        </div>
      </div>

      {/* Widget Preview Container */}
      <div
        style={{
          ...styles.grid,
          flex: 1,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: config.alignment === 'right' ? 'flex-end' : 'flex-start',
          padding: 'var(--op-space-large)',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: config.alignment === 'right' ? 'flex-end' : 'flex-start',
            gap: 'var(--op-space-medium)',
          }}
        >
          {/* Widget - only shown when open */}
          {isOpen && (
            <div
              data-theme-mode={config.theme}
              style={{
                width: '400px',
                height: '600px',
                borderRadius: 'var(--op-radius-large)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                backgroundColor: 'var(--op-color-background)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                colorScheme: config.theme,
              }}
            >
              {/* Widget Header */}
              <div
                style={{
                  backgroundColor: config.primaryColor,
                  color: 'white',
                  padding: 'var(--op-space-medium)',
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
                      backgroundColor: config.profilePicture?.startsWith('data:') || config.profilePicture?.startsWith('http')
                        ? 'transparent'
                        : 'white',
                      color: config.primaryColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'var(--op-font-weight-bold)',
                      fontSize: 'var(--op-font-medium)',
                      overflow: 'hidden',
                      backgroundImage: config.profilePicture?.startsWith('data:') || config.profilePicture?.startsWith('http')
                        ? `url(${config.profilePicture})`
                        : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {!config.profilePicture?.startsWith('data:') && !config.profilePicture?.startsWith('http') && (config.profilePicture || 'R')}
                  </div>
                  <span
                    style={{
                      fontWeight: 'var(--op-font-weight-medium)',
                      fontSize: 'var(--op-font-medium)',
                    }}
                  >
                    {config.displayName || 'Chat'}
                  </span>
                </div>
                <Button variant="ghost">
                  <HugeiconsIcon icon={RefreshIcon} color='white' size={20} />
                </Button>
              </div>

              {/* Dismissible Notice */}
              {showNotice && config.dismissibleNotice && (
                <div
                  style={{
                    padding: 'var(--op-space-small) var(--op-space-medium)',
                    backgroundColor: config.theme === 'light'
                      ? `color-mix(in srgb, ${config.primaryColor} 15%, white)`
                      : `color-mix(in srgb, ${config.primaryColor} 20%, black)`,
                    borderBottom: '1px solid var(--op-color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--op-space-small)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 'var(--op-font-x-small)',
                      color: 'var(--op-color-on-background)',
                      flex: 1,
                    }}
                    dangerouslySetInnerHTML={{ __html: config.dismissibleNotice }}
                  />
                  <button
                    onClick={() => setShowNotice(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      color: 'var(--op-color-on-background)',
                      opacity: 0.6,
                      fontSize: '16px',
                    }}
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Chat Interface */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  backgroundColor: 'var(--op-color-background)',
                  color: 'var(--op-color-on-background)',
                }}
              >
                <ChatInterface
                  initialMessage={
                    config.initialMessage || 'Hi! Let&apos;s talk about your project!'
                  }
                  collectFeedback={config.collectFeedback}
                />
              </div>
            </div>
          )}

          {/* FAB Button (below widget) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: config.buttonColor,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {isOpen ? (
              <HugeiconsIcon icon={Cancel01Icon} size={24} />
            ) : (
              <HugeiconsIcon icon={ChatBotIcon} size={24} />
            )}
          </button>
        </div>
      </div>
    </main>
  )
}
