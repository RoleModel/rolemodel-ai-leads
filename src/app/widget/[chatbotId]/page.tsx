'use client'

import { ArrowRight02Icon, Cancel01Icon } from 'hugeicons-react'
import { useParams } from 'next/navigation'
import { useEffect, useState, useSyncExternalStore } from 'react'

import { LeadsPageWithProvider } from '@/components/leads-page/LeadsPageWithProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
  collectVisitorInfo: boolean
}

const DEFAULT_CONFIG: WidgetConfig = {
  displayName: 'RoleModel Software',
  initialMessage:
    "Hi! I'm here to help you assess whether custom software might be right for your business. What problem or opportunity is prompting you to consider custom software?",
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
  collectVisitorInfo: true,
}

interface VisitorData {
  name: string
  email: string
  conversationId: string
}

// Use useSyncExternalStore to safely read sessionStorage
function useSessionStorage<T>(key: string): T | null {
  const subscribe = (callback: () => void) => {
    window.addEventListener('storage', callback)
    return () => window.removeEventListener('storage', callback)
  }

  const getSnapshot = () => {
    if (typeof window === 'undefined') return null
    return sessionStorage.getItem(key)
  }

  const getServerSnapshot = () => null

  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (!stored) return null
  try {
    return JSON.parse(stored) as T
  } catch {
    return null
  }
}

export default function WidgetPage() {
  const params = useParams()
  const chatbotId = params.chatbotId as string
  const storageKey = `widget-visitor-${chatbotId}`

  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_CONFIG)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Visitor info form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  // Check for existing session
  const storedVisitor = useSessionStorage<VisitorData>(storageKey)
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null)
  const [showChat, setShowChat] = useState(false)

  const activeVisitor = visitorData ?? storedVisitor

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

  // Auto-show chat if visitor info collection is disabled or we have existing session
  useEffect(() => {
    if (!isLoading && (!config.collectVisitorInfo || storedVisitor)) {
      setShowChat(true)
    }
  }, [isLoading, config.collectVisitorInfo, storedVisitor])

  const handleClose = () => {
    window.parent.postMessage({ type: 'WIDGET_CLOSE' }, '*')
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/intro-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          chatbotId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      const result = await response.json()

      const visitor: VisitorData = {
        name,
        email,
        conversationId: result.conversationId,
      }

      setVisitorData(visitor)
      sessionStorage.setItem(storageKey, JSON.stringify(visitor))
      setShowChat(true)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return null
  }

  // Show intro form if visitor info collection is enabled and no existing session
  if (!showChat && config.collectVisitorInfo && !activeVisitor) {
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
        {/* Header */}
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
            <span style={{ fontWeight: 'var(--op-font-weight-medium)' }}>
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

        {/* Intro Form */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 'var(--op-space-large)',
          }}
        >
          <div style={{ marginBottom: 'var(--op-space-large)' }}>
            <h2
              style={{
                fontSize: 'var(--op-font-large)',
                fontWeight: 'var(--op-font-weight-bold)',
                margin: '0 0 var(--op-space-small) 0',
              }}
            >
              Welcome!
            </h2>
            <p
              style={{
                fontSize: 'var(--op-font-small)',
                color: 'var(--op-color-neutral-on-plus-max)',
                margin: 0,
              }}
            >
              Please introduce yourself to get started.
            </p>
          </div>

          <form onSubmit={handleFormSubmit}>
            <div style={{ marginBottom: 'var(--op-space-medium)' }}>
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div style={{ marginBottom: 'var(--op-space-large)' }}>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              style={{
                width: '100%',
                backgroundColor: config.primaryColor,
                boxShadow: `var(--op-border-all) ${config.primaryColor}`,
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Starting...' : 'Start Chat'}
              {!isSubmitting && <ArrowRight02Icon size={16} style={{ marginLeft: 8 }} />}
            </Button>
          </form>

          <p
            style={{
              fontSize: 'var(--op-font-x-small)',
              color: 'var(--op-color-neutral-on-plus-max)',
              marginTop: 'var(--op-space-medium)',
            }}
          >
            Your information helps us provide better assistance.
          </p>
        </div>
      </div>
    )
  }

  // Show chat interface using LeadsPageWithProvider for conversation sync
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
      <LeadsPageWithProvider
        chatbotId={chatbotId}
        showSidebar={false}
        loadFromApi={true}
        visitorName={activeVisitor?.name}
        visitorEmail={activeVisitor?.email}
        conversationId={activeVisitor?.conversationId}
      />
    </div>
  )
}
