'use client'

import { Cancel01Icon } from 'hugeicons-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { ChatInterface } from '@/components/chat/ChatInterface'

interface WidgetConfig {
  displayName: string
  initialMessage: string
  theme: 'light' | 'dark'
  primaryColor: string
  buttonColor: string
  alignment: 'left' | 'right'
  profilePicture: string
  messagePlaceholder: string
  collectFeedback: boolean
  regenerateMessages: boolean
  dismissibleNotice: string
  suggestedMessagesPersist: boolean
  usePrimaryForHeader: boolean
}

const DEFAULT_CONFIG: WidgetConfig = {
  displayName: 'RoleModel Software',
  initialMessage: "Hi! Let's talk about your project!",
  theme: 'light',
  primaryColor: '#007BFF',
  buttonColor: '#000000',
  alignment: 'right',
  profilePicture: 'R',
  messagePlaceholder: 'Message...',
  collectFeedback: true,
  regenerateMessages: true,
  dismissibleNotice: '',
  suggestedMessagesPersist: false,
  usePrimaryForHeader: true,
}

export default function WidgetPage() {
  const params = useParams()
  const chatbotId = params.chatbotId as string
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_CONFIG)
  const [showNotice, setShowNotice] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch(`/api/widget-config?chatbotId=${chatbotId}`)
        const data = await res.json()
        if (data.config) {
          setConfig({ ...DEFAULT_CONFIG, ...data.config })
        }
      } catch (error) {
        console.error('Error loading widget config:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadConfig()
  }, [chatbotId])

  if (isLoading) {
    return null
  }

  const handleClose = () => {
    // Send message to parent window to close the widget
    window.parent.postMessage({ type: 'WIDGET_CLOSE' }, '*')
  }

  return (
    <div
      data-theme-mode={config.theme}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: 'var(--op-color-background)',
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
              backgroundColor:
                config.profilePicture?.startsWith('data:') ||
                config.profilePicture?.startsWith('http')
                  ? 'transparent'
                  : 'white',
              color: config.primaryColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'var(--op-font-weight-bold)',
              fontSize: 'var(--op-font-medium)',
              overflow: 'hidden',
              backgroundImage:
                config.profilePicture?.startsWith('data:') ||
                config.profilePicture?.startsWith('http')
                  ? `url(${config.profilePicture})`
                  : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {!config.profilePicture?.startsWith('data:') &&
              !config.profilePicture?.startsWith('http') &&
              (config.profilePicture || 'R')}
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
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 'var(--op-space-x-small)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Cancel01Icon size={20} />
        </button>
      </div>

      {/* Dismissible Notice */}
      {showNotice && config.dismissibleNotice && (
        <div
          style={{
            padding: 'var(--op-space-small) var(--op-space-medium)',
            backgroundColor:
              config.theme === 'light'
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
          chatbotId={chatbotId}
          initialMessage={config.initialMessage}
          collectFeedback={config.collectFeedback}
        />
      </div>
    </div>
  )
}
