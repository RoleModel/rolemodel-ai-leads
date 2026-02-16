'use client'

import {
  Archive01Icon,
  Location01Icon,
  Mail01Icon,
  Message01Icon,
  RotateClockwiseIcon,
  UserIcon,
} from 'hugeicons-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'

import { NavigationSidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

import { MessageBubble } from './_components/MessageBubble'
import { VisitorDetailsCard, getLocationString } from './_components/VisitorDetailsCard'

interface VisitorMetadata {
  ip?: string
  geo?: {
    country?: string
    countryCode?: string
    region?: string
    city?: string
    timezone?: string
  }
  userAgent?: string
  referer?: string
  timestamp?: string
}

interface Conversation {
  id: string
  visitor_id: string | null
  visitor_name: string | null
  visitor_email: string | null
  visitor_metadata: VisitorMetadata | null
  started_at: string
  last_message_at: string
  message_count: number
  lead_captured: boolean
  is_archived: boolean | null
  archived_at: string | null
}

interface Message {
  id: string
  role: string
  content: string
  created_at: string
}

type ArchiveFilter = 'active' | 'archived' | 'all'

export default function ChatLogsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    null
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>('active')
  const [highlightedConvId, setHighlightedConvId] = useState<string | null>(null)
  const conversationRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const loadConversations = useCallback(async () => {
    setIsLoading(true)
    try {
      const archiveParam =
        archiveFilter === 'archived' ? 'true' : archiveFilter === 'all' ? 'all' : 'false'
      const res = await fetch(`/api/conversations?archived=${archiveParam}`)
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [archiveFilter])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const res = await fetch(`/api/conversations?conversationId=${conversationId}`)
      const data = await res.json()
      setMessages(data.messages || [])
      setSelectedConversation(data.conversation)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }, [])

  useEffect(() => {
    const conversationId = searchParams.get('conversation')
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === conversationId)
      if (conv) {
        loadMessages(conversationId)
        setHighlightedConvId(conversationId)
        setTimeout(() => setHighlightedConvId(null), 3000)
      }
    }
  }, [searchParams, conversations, loadMessages])

  useEffect(() => {
    if (!highlightedConvId) return
    const node = conversationRefs.current[highlightedConvId]
    if (node) {
      node.scrollIntoView({ behavior: 'instant', block: 'center' })
    }
  }, [highlightedConvId])

  function handleViewLead(conversationId: string) {
    router.push(`/admin/activity/leads?conversation=${conversationId}`)
  }

  async function handleArchive(conversationId: string, archive: boolean) {
    try {
      const res = await fetch('/api/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: conversationId, is_archived: archive }),
      })
      if (res.ok) {
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null)
          setMessages([])
        }
        loadConversations()
      }
    } catch (error) {
      console.error('Error archiving conversation:', error)
    }
  }

  return (
    <div className="admin-page">
      <TopBar />

      <div className="admin-page__body">
        <Suspense fallback={<div>Loading...</div>}>
          <NavigationSidebar />
        </Suspense>

        <main className="admin-page__main">
          <header className="admin-header">
            <div className="admin-header__top">
              <div>
                <h1 className="admin-header__title">Chat logs</h1>
                <p className="admin-header__subtitle">
                  View all conversations and message history
                </p>
              </div>
            </div>

            <div className="admin-filters">
              <div className="admin-filters__group">
                <span className="admin-filters__label">Show:</span>
                <div className="admin-filters__buttons">
                  {(['active', 'archived', 'all'] as const).map((filter) => (
                    <Button
                      key={filter}
                      variant={archiveFilter === filter ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setArchiveFilter(filter)}
                      className="admin-filters__button"
                    >
                      {filter}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <div className="admin-split">
            <div className="admin-split__sidebar">
              <ScrollArea style={{ flex: 1, minHeight: 0 }}>
                {isLoading ? (
                  <p className="admin-loading">Loading...</p>
                ) : conversations.length === 0 ? (
                  <div className="admin-empty admin-empty--centered">
                    <p className="admin-empty__title">No chats found</p>
                    <p className="admin-empty__description">
                      Try adjusting your filters or check back later for new
                      conversations.
                    </p>
                  </div>
                ) : (
                  <div>
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        ref={(node) => {
                          conversationRefs.current[conv.id] = node
                        }}
                        onClick={() => loadMessages(conv.id)}
                        className={`admin-list-item ${
                          selectedConversation?.id === conv.id
                            ? 'admin-list-item--selected'
                            : ''
                        } ${highlightedConvId === conv.id ? 'admin-list-item--highlighted' : ''}`}
                      >
                        <div className="admin-list-item__header">
                          <UserIcon className="icon-sm admin-list-item__icon" />
                          <span className="admin-list-item__title">
                            {conv.visitor_name ||
                              conv.visitor_email ||
                              `Visitor ${conv.visitor_id?.slice(0, 8) || conv.id.slice(0, 8)}`}
                          </span>
                          {conv.is_archived && (
                            <span className="admin-badge admin-badge--archived">
                              Archived
                            </span>
                          )}
                          {conv.lead_captured && (
                            <span className="admin-badge admin-badge--lead">Lead</span>
                          )}
                          <Button
                            variant="ghosticon"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleArchive(conv.id, !conv.is_archived)
                            }}
                            title={conv.is_archived ? 'Restore' : 'Archive'}
                          >
                            {conv.is_archived ? (
                              <RotateClockwiseIcon className="icon-sm" />
                            ) : (
                              <Archive01Icon className="icon-sm" />
                            )}
                          </Button>
                        </div>
                        {conv.visitor_email && (
                          <div className="admin-list-item__meta">
                            <Mail01Icon className="icon-sm admin-list-item__icon" />
                            <span className="admin-list-item__meta-text">
                              {conv.visitor_email}
                            </span>
                          </div>
                        )}
                        {getLocationString(conv.visitor_metadata) && (
                          <div className="admin-list-item__meta">
                            <Location01Icon className="icon-sm admin-list-item__icon" />
                            <span className="admin-list-item__meta-text">
                              {getLocationString(conv.visitor_metadata)}
                            </span>
                          </div>
                        )}
                        <div className="admin-list-item__meta">
                          <Message01Icon className="icon-sm admin-list-item__icon" />
                          <span className="admin-list-item__meta-text">
                            {conv.message_count} messages
                          </span>
                          <span className="admin-list-item__meta-text">
                            · {new Date(conv.last_message_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            <div className="admin-split__content">
              <ScrollArea style={{ flex: 1, minHeight: 0 }}>
                <div className="admin-content admin-content--muted">
                  {!selectedConversation ? (
                    <NoConversationSelected />
                  ) : (
                    <div className="admin-content__list">
                      <VisitorDetailsCard
                        conversation={selectedConversation}
                        onViewLead={handleViewLead}
                      />
                      {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function NoConversationSelected() {
  return (
    <div className="admin-empty admin-empty--centered">
      Select a conversation to view messages
    </div>
  )
}
