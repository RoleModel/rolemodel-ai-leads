'use client'

import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

import { SidebarLeftIcon, Globe02Icon, PlusSignIcon, Settings02Icon, Delete02Icon } from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useChat } from "@ai-sdk/react"
import { TextStreamChatTransport, isTextUIPart, type UIMessage } from "ai"
import { AnimatedConversationDemo } from "@/components/leads-page/AnimatedConversationDemo"
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation"
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message"
import {
  PromptInput,
  PromptInputProvider,
  PromptInputTextarea,
  PromptInputBody,
  PromptInputFooter,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputTools,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  PromptInputActionMenuTrigger,
  PromptInputSpeechButton,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input"

interface Suggestion {
  id: string
  text: string
  isEditing?: boolean
}

interface CustomButton {
  id: string
  text: string
  url: string
}

interface LeadsPageViewProps {
  chatbotId: string
  showSidebar?: boolean
  editMode?: boolean
}

const styles = {
  container: {
    display: 'flex',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
  sidebar: {
    borderRight: '1px solid var(--op-color-border)',
    backgroundColor: 'var(--op-color-background)',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: 'var(--op-space-medium)',
    transition: 'width 0.2s ease',
  },
  brandHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'var(--op-space-large)',
  },
  brandLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--op-space-small)',
  },
  content: {
    flex: 1,
    display: 'flex',
    width: '100%',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  hero: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--op-space-large)',
    padding: 'var(--op-space-3x-large)',
    textAlign: 'center' as const,
    flex: 1,
  },
  messages: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: 'var(--op-space-large)',
  },
  inputWrapper: {
    paddingBottom: 'var(--op-space-large)',
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
    position: 'relative' as const,
  },
  gradient: {
    filter: 'blur(16px)',
    opacity: .9,
    pointerEvents: 'none' as const,
    zIndex: 0,
    backgroundImage: 'linear-gradient(90deg, #8C69B8, #B3D99A, #FDE385, #87D4E9, #8C69B8, #B3D99A)',
    height: '0.75rem',
    position: 'absolute' as const,
    left: '16px',
    right: '16px',
    top: '90%'
  },
}

export function LeadsPageView({ chatbotId, showSidebar = true, editMode = false }: LeadsPageViewProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [favicon, setFavicon] = useState<string>('')
  const [logo, setLogo] = useState<string>('')
  const [pageTitle, setPageTitle] = useState('Leads page')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [customButtons, setCustomButtons] = useState<CustomButton[]>([])
  const [showDemo, setShowDemo] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Edit mode states for custom buttons
  const [editingButtonId, setEditingButtonId] = useState<string | null>(null)
  const [editingButtonText, setEditingButtonText] = useState('')
  const [editingButtonUrl, setEditingButtonUrl] = useState('')

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch(`/api/leads-page-settings?chatbotId=${chatbotId}`)
        const data = await response.json()

        if (data.settings) {
          setPageTitle(data.settings.page_title || 'Leads page')
          setFavicon(data.settings.favicon || '')
          setLogo(data.settings.logo || '')

          // Load custom buttons if available
          if (data.settings.custom_buttons) {
            try {
              const buttons = JSON.parse(data.settings.custom_buttons)
              setCustomButtons(buttons)
            } catch (e) {
              console.error('Failed to parse custom buttons:', e)
            }
          }

          // Load suggestions if available
          if (data.settings.suggestions) {
            try {
              const suggestions = JSON.parse(data.settings.suggestions)
              setSuggestions(suggestions)
            } catch (e) {
              console.error('Failed to parse suggestions:', e)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }

    loadSettings()
  }, [chatbotId])

  const chatTransport = useMemo(
    () => new TextStreamChatTransport<UIMessage>({
      api: "/api/chat",
      body: {
        chatbotId,
      },
      prepareSendMessagesRequest: ({ messages, body }) => ({
        body: {
          ...body,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.parts
              .filter(part => part.type === 'text')
              .map(part => (part as { type: 'text'; text: string }).text)
              .join('\n')
          }))
        }
      })
    }),
    [chatbotId]
  )

  const { messages, sendMessage, status } = useChat<UIMessage>({
    transport: chatTransport,
  })

  const handlePromptSubmit = async (message: PromptInputMessage) => {
    if (!message.text.trim()) return
    setShowDemo(false)
    await sendMessage({
      text: message.text,
    })
  }

  const getMessageContent = useCallback((message: UIMessage) => {
    const textParts = message.parts.filter(isTextUIPart)
    return textParts.map((part) => part.text).join("\n")
  }, [])

  const isStreaming = status === "streaming"

  // Custom button handlers
  const handleAddCustomButton = () => {
    const newButton: CustomButton = {
      id: `button-${Date.now()}`,
      text: 'Button',
      url: 'https://example.com',
    }
    setCustomButtons([...customButtons, newButton])
    setEditingButtonId(newButton.id)
    setEditingButtonText(newButton.text)
    setEditingButtonUrl(newButton.url)
  }

  const handleDeleteCustomButton = (id: string) => {
    setCustomButtons(customButtons.filter(b => b.id !== id))
    setEditingButtonId(null)
  }

  const handleOpenEditPopover = (button: CustomButton) => {
    setEditingButtonId(button.id)
    setEditingButtonText(button.text)
    setEditingButtonUrl(button.url)
  }

  const handleSaveCustomButton = () => {
    if (editingButtonId) {
      setCustomButtons(customButtons.map(b =>
        b.id === editingButtonId ? { ...b, text: editingButtonText, url: editingButtonUrl } : b
      ))
      setEditingButtonId(null)
    }
  }

  // Suggestion handlers
  const handleAddSuggestion = () => {
    const newSuggestion: Suggestion = {
      id: `suggestion-${Date.now()}`,
      text: 'Suggestion',
      isEditing: true,
    }
    setSuggestions([...suggestions, newSuggestion])
  }

  const handleDeleteSuggestion = (id: string) => {
    setSuggestions(suggestions.filter(s => s.id !== id))
  }

  const handleEditSuggestion = (id: string, text: string) => {
    setSuggestions(suggestions.map(s =>
      s.id === id ? { ...s, text, isEditing: false } : s
    ))
  }

  const handleSuggestionTextChange = (id: string, text: string) => {
    setSuggestions(suggestions.map(s =>
      s.id === id ? { ...s, text } : s
    ))
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      {showSidebar && (
        <div style={{ ...styles.sidebar, width: sidebarCollapsed ? '60px' : '260px' }}>
          <div style={styles.brandHeader}>
            {!sidebarCollapsed && (
              <div style={styles.brandLogo}>
                {logo ? (
                  <Image src={logo} alt="Logo" width={120} height={40} style={{ maxWidth: '120px', maxHeight: '40px', objectFit: 'contain' }} />
                ) : (
                  <>
                    <span style={{ fontWeight: 'bold', color: 'var(--op-color-primary)', fontSize: 15 }}>RoleModel</span>
                    <span style={{ fontSize: 11, color: 'var(--op-color-neutral-on-plus-max)' }}>software</span>
                  </>
                )}
              </div>
            )}

            <Button variant="ghosticon" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              <HugeiconsIcon icon={SidebarLeftIcon} size={20} />
            </Button>
          </div>

          {/* Custom Buttons at bottom */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--op-space-small)' }}>
            {!sidebarCollapsed && (
              <>
                <Button variant="secondary" style={{ width: '100%' }}>
                  rolemodelsoftware.com
                </Button>

                {/* Custom Buttons */}
                {customButtons.map((button) => (
                  <div key={button.id}>
                    {editMode ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--op-space-x-small)',
                        padding: 'var(--op-space-small)',
                        border: '1px dashed var(--op-color-border)',
                        borderRadius: 'var(--op-radius-medium)',
                      }}>
                        <span style={{
                          flex: 1,
                          fontSize: 'var(--op-font-small)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {button.text}
                        </span>
                        <Popover
                          open={editingButtonId === button.id}
                          onOpenChange={(open) => {
                            if (open) {
                              handleOpenEditPopover(button)
                            } else {
                              setEditingButtonId(null)
                            }
                          }}
                        >
                          <PopoverTrigger asChild>
                            <Button variant="ghosticon">
                              <HugeiconsIcon icon={Settings02Icon} size={16} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="end" style={{ width: '400px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--op-space-medium)' }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}>
                                <h3 style={{
                                  fontSize: 'var(--op-font-medium)',
                                  fontWeight: 600,
                                  margin: 0
                                }}>
                                  {button.text}
                                </h3>
                                <Button
                                  variant="ghosticon"
                                  onClick={() => setEditingButtonId(null)}
                                >
                                  <span style={{ fontSize: '20px' }}>×</span>
                                </Button>
                              </div>

                              <div>
                                <Label style={{
                                  display: 'block',
                                  marginBottom: 'var(--op-space-x-small)',
                                  fontSize: 'var(--op-font-small)',
                                }}>
                                  Button label
                                </Label>
                                <Input
                                  value={editingButtonText}
                                  onChange={(e) => setEditingButtonText(e.target.value)}
                                  placeholder="Contact us"
                                />
                              </div>

                              <div>
                                <Label style={{
                                  display: 'block',
                                  marginBottom: 'var(--op-space-x-small)',
                                  fontSize: 'var(--op-font-small)',
                                }}>
                                  Link
                                </Label>
                                <div style={{ display: 'flex', gap: 0 }}>
                                  <div style={{
                                    padding: 'var(--op-space-small) var(--op-space-medium)',
                                    backgroundColor: 'var(--op-color-neutral-plus-eight)',
                                    border: '1px solid var(--op-color-border)',
                                    borderRight: 'none',
                                    borderTopLeftRadius: 'var(--op-radius-medium)',
                                    borderBottomLeftRadius: 'var(--op-radius-medium)',
                                    fontSize: 'var(--op-font-small)',
                                    color: 'var(--op-color-on-background)',
                                  }}>
                                    https://
                                  </div>
                                  <Input
                                    value={editingButtonUrl.replace(/^https?:\/\//, '')}
                                    onChange={(e) => setEditingButtonUrl(e.target.value.replace(/^https?:\/\//, ''))}
                                    placeholder="example.com"
                                    style={{
                                      borderTopLeftRadius: 0,
                                      borderBottomLeftRadius: 0,
                                    }}
                                  />
                                </div>
                              </div>

                              <Button
                                variant="primary"
                                onClick={handleSaveCustomButton}
                              >
                                Save
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Button
                          variant="ghosticon"
                          onClick={() => handleDeleteCustomButton(button.id)}
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={16} />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        style={{ width: '100%' }}
                        onClick={() => window.open(button.url.startsWith('http') ? button.url : `https://${button.url}`, '_blank')}
                      >
                        {button.text}
                      </Button>
                    )}
                  </div>
                ))}

                {/* Add Button */}
                {editMode && (
                  <Button
                    variant="ghost"
                    style={{ justifyContent: 'flex-start', gap: 'var(--op-space-small)', width: '100%', border: '1px dashed var(--op-color-border)' }}
                    onClick={handleAddCustomButton}
                  >
                    <HugeiconsIcon icon={PlusSignIcon} size={16} /> Add button
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={styles.content}>
        {messages.length === 0 ? (
          <div style={styles.hero}>
            <div style={{ width: 56, height: 56, fontSize: 28, borderRadius: 12, backgroundColor: favicon ? 'transparent' : 'var(--op-color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {favicon ? (
                <Image src={favicon} alt="Favicon" width={56} height={56} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                'R'
              )}
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 0 }}>{pageTitle}</h2>

            {/* Animated Conversation Demo */}
            {showDemo ? (
              <AnimatedConversationDemo onInterrupt={() => setShowDemo(false)} />
            ) : (
              <div style={styles.inputWrapper}>

                <PromptInputProvider>
                  <PromptInput onSubmit={handlePromptSubmit} style={{ width: '100%', maxWidth: '600px', zIndex: 2, position: 'relative' as const }}>
                    <PromptInputAttachments>
                      {(attachment) => <PromptInputAttachment key={attachment.id} data={attachment} />}
                    </PromptInputAttachments>
                    <PromptInputBody>
                      <PromptInputTextarea placeholder="Ask me anything..." />
                    </PromptInputBody>
                    <PromptInputFooter>
                      <PromptInputTools>
                        <PromptInputActionMenu>
                          <PromptInputActionMenuTrigger>
                            <HugeiconsIcon icon={PlusSignIcon} size={20} />
                          </PromptInputActionMenuTrigger>
                          <PromptInputActionMenuContent>
                            <PromptInputActionAddAttachments />
                          </PromptInputActionMenuContent>
                        </PromptInputActionMenu>
                        <PromptInputSpeechButton textareaRef={textareaRef} />
                        <PromptInputButton>
                          <HugeiconsIcon icon={Globe02Icon} size={20} />
                          <span>Search</span>
                        </PromptInputButton>
                      </PromptInputTools>
                      <PromptInputSubmit status={isStreaming ? 'streaming' : undefined} />
                    </PromptInputFooter>
                  </PromptInput>
                </PromptInputProvider>
                <div style={styles.gradient} />
              </div>
            )}

            {/* Suggestions */}
            <div style={{ display: 'flex', gap: 'var(--op-space-small)', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--op-space-x-small)' }}>
                  {suggestion.isEditing ? (
                    <Input
                      autoFocus
                      value={suggestion.text}
                      onChange={(e) => handleSuggestionTextChange(suggestion.id, e.target.value)}
                      onBlur={() => handleEditSuggestion(suggestion.id, suggestion.text)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleEditSuggestion(suggestion.id, suggestion.text)
                        }
                      }}
                    />
                  ) : (
                    <Button variant="pill" onClick={() => handlePromptSubmit({ text: suggestion.text, files: [] })}>
                      {suggestion.text}
                    </Button>
                  )}
                  {editMode && !suggestion.isEditing && (
                    <>
                      <Button
                        variant="ghosticon"
                        onClick={() => handleDeleteSuggestion(suggestion.id)}
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={16} />
                      </Button>
                      <Button
                        variant="ghosticon"
                        onClick={() => setSuggestions(suggestions.map(s =>
                          s.id === suggestion.id ? { ...s, isEditing: true } : s
                        ))}
                      >
                        <HugeiconsIcon icon={Settings02Icon} size={16} />
                      </Button>
                    </>
                  )}
                </div>
              ))}
              {editMode && (
                <Button variant="dashedpill" onClick={handleAddSuggestion}>
                  <HugeiconsIcon icon={PlusSignIcon} size={16} /> Add suggestion
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div style={styles.messages}>
              <Conversation>
                <ConversationContent>
                  {messages.map((message) => (
                    <Message
                      key={message.id}
                      from={message.role === 'user' ? 'user' : 'assistant'}
                    >
                      <MessageContent>
                        <MessageResponse>
                          {getMessageContent(message)}
                        </MessageResponse>
                      </MessageContent>
                    </Message>
                  ))}
                </ConversationContent>
              </Conversation>
            </div>

            <div style={styles.inputWrapper}>
              <PromptInput onSubmit={handlePromptSubmit} maxFiles={0} accept="">
                <PromptInputTextarea placeholder="Ask me anything..." />
                <PromptInputFooter>
                  <div />
                  <PromptInputSubmit status={isStreaming ? 'streaming' : undefined} />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
