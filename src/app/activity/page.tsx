'use client'

import { Location01Icon, Message01Icon, UserIcon } from 'hugeicons-react'
import { Suspense, useEffect, useState } from 'react'

import { NavigationSidebar } from '@/components/layout/NavigationSidebar'
import { TopBar } from '@/components/layout/TopBar'

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
  visitor_id: string
  visitor_name: string | null
  visitor_email: string | null
  visitor_metadata: VisitorMetadata | null
  started_at: string
  last_message_at: string
  message_count: number
}

interface Message {
  id: string
  role: string
  content: string
  created_at: string
}

export default function ActivityPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    null
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [])

  async function loadConversations() {
    try {
      const res = await fetch('/api/conversations')
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadMessages(conversationId: string) {
    try {
      const res = await fetch(`/api/conversations?conversationId=${conversationId}`)
      const data = await res.json()
      setMessages(data.messages || [])
      setSelectedConversation(data.conversation)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Suspense fallback={<div>Loading...</div>}>
          <NavigationSidebar />
        </Suspense>

        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: 'var(--op-space-large)',
              borderBottom: '1px solid var(--op-color-border)',
            }}
          >
            <h1
              style={{
                fontSize: 'var(--op-font-x-large)',
                fontWeight: 'var(--op-font-weight-bold)',
                margin: 0,
              }}
            >
              Activity
            </h1>
            <p
              style={{
                fontSize: 'var(--op-font-small)',
                color: 'var(--op-color-neutral-on-plus-max)',
                margin: 'var(--op-space-2x-small) 0 0 0',
              }}
            >
              View all conversations and message history
            </p>
          </div>

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Conversations List */}
            <div
              style={{
                width: '350px',
                borderRight: '1px solid var(--op-color-border)',
                overflow: 'auto',
              }}
            >
              {isLoading ? (
                <p
                  style={{
                    padding: 'var(--op-space-large)',
                    color: 'var(--op-color-neutral-on-plus-max)',
                  }}
                >
                  Loading...
                </p>
              ) : conversations.length === 0 ? (
                <p
                  style={{
                    padding: 'var(--op-space-large)',
                    color: 'var(--op-color-neutral-on-plus-max)',
                  }}
                >
                  No conversations yet
                </p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => loadMessages(conv.id)}
                    style={{
                      padding: 'var(--op-space-medium) var(--op-space-large)',
                      borderBottom: '1px solid var(--op-color-border)',
                      cursor: 'pointer',
                      backgroundColor:
                        selectedConversation?.id === conv.id
                          ? 'var(--op-color-primary-plus-eight)'
                          : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedConversation?.id !== conv.id) {
                        e.currentTarget.style.backgroundColor =
                          'var(--op-color-neutral-plus-eight)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedConversation?.id !== conv.id) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--op-space-small)',
                        marginBottom: 'var(--op-space-2x-small)',
                      }}
                    >
                      <UserIcon
                        className="icon-sm"
                        style={{ color: 'var(--op-color-neutral-on-plus-max)' }}
                      />
                      <span
                        style={{
                          fontSize: 'var(--op-font-small)',
                          fontWeight: 'var(--op-font-weight-bold)',
                        }}
                      >
                        {conv.visitor_name ||
                          conv.visitor_email ||
                          `Visitor ${conv.visitor_id.slice(0, 8)}`}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--op-space-x-small)',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Message01Icon
                        className="icon-sm"
                        style={{ color: 'var(--op-color-neutral-on-plus-max)' }}
                      />
                      <span
                        style={{
                          fontSize: 'var(--op-font-x-small)',
                          color: 'var(--op-color-neutral-on-plus-max)',
                        }}
                      >
                        {conv.message_count} messages
                      </span>
                      <span
                        style={{
                          fontSize: 'var(--op-font-x-small)',
                          color: 'var(--op-color-neutral-on-plus-max)',
                        }}
                      >
                        · {new Date(conv.last_message_at).toLocaleString()}
                      </span>
                    </div>
                    {conv.visitor_metadata?.geo && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--op-space-x-small)',
                          marginTop: 'var(--op-space-2x-small)',
                        }}
                      >
                        <Location01Icon
                          className="icon-sm"
                          style={{ color: 'var(--op-color-neutral-on-plus-max)' }}
                        />
                        <span
                          style={{
                            fontSize: 'var(--op-font-x-small)',
                            color: 'var(--op-color-neutral-on-plus-max)',
                          }}
                        >
                          {[
                            conv.visitor_metadata.geo.city,
                            conv.visitor_metadata.geo.region,
                            conv.visitor_metadata.geo.country,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Messages View */}
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                padding: 'var(--op-space-large)',
                backgroundColor: 'var(--op-color-neutral-plus-eight)',
              }}
            >
              {!selectedConversation ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'var(--op-color-neutral-on-plus-max)',
                  }}
                >
                  Select a conversation to view messages
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--op-space-medium)',
                  }}
                >
                  {/* Visitor Info Card */}
                  {selectedConversation.visitor_metadata && (
                    <div
                      style={{
                        padding: 'var(--op-space-medium)',
                        borderRadius: 'var(--op-radius-medium)',
                        backgroundColor: 'var(--op-color-background)',
                        border: '1px solid var(--op-color-border)',
                        marginBottom: 'var(--op-space-medium)',
                      }}
                    >
                      <h3
                        style={{
                          fontSize: 'var(--op-font-small)',
                          fontWeight: 'var(--op-font-weight-bold)',
                          marginBottom: 'var(--op-space-small)',
                          color: 'var(--op-color-neutral-on-plus-max)',
                        }}
                      >
                        Visitor Details
                      </h3>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                          gap: 'var(--op-space-small)',
                          fontSize: 'var(--op-font-x-small)',
                        }}
                      >
                        {selectedConversation.visitor_metadata.geo && (
                          <div>
                            <span style={{ color: 'var(--op-color-neutral-on-plus-max)' }}>
                              Location
                            </span>
                            <p style={{ margin: 'var(--op-space-2x-small) 0 0 0' }}>
                              {[
                                selectedConversation.visitor_metadata.geo.city,
                                selectedConversation.visitor_metadata.geo.region,
                                selectedConversation.visitor_metadata.geo.country,
                              ]
                                .filter(Boolean)
                                .join(', ') || 'Unknown'}
                            </p>
                          </div>
                        )}
                        {selectedConversation.visitor_metadata.ip && (
                          <div>
                            <span style={{ color: 'var(--op-color-neutral-on-plus-max)' }}>
                              IP Address
                            </span>
                            <p style={{ margin: 'var(--op-space-2x-small) 0 0 0', fontFamily: 'monospace' }}>
                              {selectedConversation.visitor_metadata.ip}
                            </p>
                          </div>
                        )}
                        {selectedConversation.visitor_metadata.geo?.timezone && (
                          <div>
                            <span style={{ color: 'var(--op-color-neutral-on-plus-max)' }}>
                              Timezone
                            </span>
                            <p style={{ margin: 'var(--op-space-2x-small) 0 0 0' }}>
                              {selectedConversation.visitor_metadata.geo.timezone}
                            </p>
                          </div>
                        )}
                        {selectedConversation.visitor_metadata.referer && (
                          <div>
                            <span style={{ color: 'var(--op-color-neutral-on-plus-max)' }}>
                              Referrer
                            </span>
                            <p
                              style={{
                                margin: 'var(--op-space-2x-small) 0 0 0',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={selectedConversation.visitor_metadata.referer}
                            >
                              {selectedConversation.visitor_metadata.referer}
                            </p>
                          </div>
                        )}
                      </div>
                      {selectedConversation.visitor_metadata.userAgent && (
                        <div style={{ marginTop: 'var(--op-space-small)' }}>
                          <span
                            style={{
                              fontSize: 'var(--op-font-x-small)',
                              color: 'var(--op-color-neutral-on-plus-max)',
                            }}
                          >
                            Browser
                          </span>
                          <p
                            style={{
                              margin: 'var(--op-space-2x-small) 0 0 0',
                              fontSize: 'var(--op-font-x-small)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={selectedConversation.visitor_metadata.userAgent}
                          >
                            {selectedConversation.visitor_metadata.userAgent}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      style={{
                        display: 'flex',
                        justifyContent:
                          message.role === 'user' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: 'var(--op-space-small) var(--op-space-medium)',
                          borderRadius: 'var(--op-radius-medium)',
                          backgroundColor:
                            message.role === 'user'
                              ? 'var(--op-color-primary-base)'
                              : 'var(--op-color-neutral-plus-eight)',
                          color:
                            message.role === 'user'
                              ? 'var(--op-color-primary-on-base)'
                              : 'var(--op-color-neutral-on-plus-eight)',
                        }}
                      >
                        <div
                          style={{
                            fontSize: 'var(--op-font-small)',
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                          }}
                        >
                          {message.content}
                        </div>
                        <div
                          style={{
                            fontSize: 'var(--op-font-x-small)',
                            opacity: 0.7,
                            marginTop: 'var(--op-space-2x-small)',
                          }}
                        >
                          {new Date(message.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
