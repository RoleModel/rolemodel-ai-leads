'use client'

import { Message01Icon, UserIcon } from 'hugeicons-react'
import { Suspense, useEffect, useState } from 'react'

import { NavigationSidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Conversation {
  id: string
  visitor_id: string
  visitor_name: string | null
  visitor_email: string | null
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

export default function ChatLogsPage() {
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
              Chat logs
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
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <ScrollArea style={{ flex: 1, minHeight: 0 }}>
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
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 'var(--op-space-x-large)',
                      textAlign: 'center',
                      color: 'var(--op-color-neutral-on-plus-max)',
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 'var(--op-font-medium)',
                        fontWeight: 600,
                      }}
                    >
                      No chats found
                    </p>
                    <p
                      style={{
                        margin: 'var(--op-space-small) 0 0 0',
                        fontSize: 'var(--op-font-small)',
                      }}
                    >
                      Try adjusting your filters or check back later for new
                      conversations.
                    </p>
                  </div>
                ) : (
                  <div>
                    {conversations.map((conv) => (
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
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Messages View */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <ScrollArea style={{ flex: 1, minHeight: 0 }}>
                <div
                  style={{
                    padding: 'var(--op-space-large)',
                    backgroundColor: 'var(--op-color-neutral-plus-eight)',
                    minHeight: '100%',
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
                                  : 'var(--op-color-background)',
                              color:
                                message.role === 'user'
                                  ? 'var(--op-color-primary-on-base)'
                                  : 'var(--op-color-on-background)',
                              boxShadow:
                                message.role === 'user'
                                  ? '0 2px 8px -2px rgba(0, 0, 0, 0.1)'
                                  : '0 1px 4px -1px rgba(0, 0, 0, 0.08)',
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
              </ScrollArea>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
