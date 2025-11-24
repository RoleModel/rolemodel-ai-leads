'use client'

import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

import { SidebarLeftIcon, PlusSignIcon, Settings02Icon, Delete02Icon, Globe02Icon } from '@hugeicons-pro/core-stroke-standard'
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
import { useLeadsPageSettings } from "@/contexts/LeadsPageSettingsContext"
import {
  PromptInput,
  PromptInputProvider,
  PromptInputTextarea,
  PromptInputBody,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  PromptInputSpeechButton,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input"

interface Suggestion {
  id: string
  text: string
  isSelected?: boolean
}

interface CustomButton {
  id: string
  text: string
  url: string
}

interface ChatHistory {
  id: string
  title: string
  messages: UIMessage[]
  timestamp: number
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
}

const DEFAULT_SUGGESTIONS: Suggestion[] = [
  { id: '1', text: "What types of software do you build?" },
  { id: '2', text: "How much does custom software cost?" },
  { id: '3', text: "How long does a project typically take?" },
  { id: '4', text: "Do you work with startups?" },
]

export function LeadsPageView({ chatbotId, showSidebar = true, editMode = false }: LeadsPageViewProps) {
  const { settings } = useLeadsPageSettings()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>(DEFAULT_SUGGESTIONS)
  const [customButtons, setCustomButtons] = useState<CustomButton[]>([])
  const [showDemo, setShowDemo] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Chat history - read from localStorage on each render (no setState in effects)
  const getChatHistory = useCallback((): ChatHistory[] => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('leads-page-chat-history')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return []
      }
    }
    return []
  }, [])

  const chatHistory = getChatHistory()
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)

  // Edit mode states for custom buttons
  const [editingButtonId, setEditingButtonId] = useState<string | null>(null)
  const [editingButtonText, setEditingButtonText] = useState('')
  const [editingButtonUrl, setEditingButtonUrl] = useState('')

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
      isSelected: true,
    }
    setSuggestions([...suggestions.map(s => ({ ...s, isSelected: false })), newSuggestion])
  }

  const handleDeleteSuggestion = (id: string) => {
    setSuggestions(suggestions.filter(s => s.id !== id))
  }

  const handleSelectSuggestion = (id: string) => {
    setSuggestions(suggestions.map(s =>
      s.id === id ? { ...s, isSelected: true } : { ...s, isSelected: false }
    ))
  }

  const handleSuggestionTextChange = (id: string, text: string) => {
    setSuggestions(suggestions.map(s =>
      s.id === id ? { ...s, text } : s
    ))
  }

  // Chat history handlers
  const handleNewChat = () => {
    setCurrentChatId(`chat-${Date.now()}`)
    setShowDemo(true)
    window.location.reload() // Simple way to clear messages for now
  }

  const handleSwitchChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId)
    if (chat) {
      setCurrentChatId(chatId)
      setShowDemo(false)
      // For now, just show that chat is selected. Full message loading would require useChat integration
      alert(`Switching to chat: ${chat.title}\n\nFull chat loading will be implemented in next iteration.`)
    }
  }

  // Save current chat to localStorage when messages change (external system sync)
  useEffect(() => {
    if (messages.length > 0 && !showDemo && currentChatId) {
      // Generate title from first user message
      const firstUserMessage = messages.find(m => m.role === 'user')
      const title = firstUserMessage
        ? getMessageContent(firstUserMessage).slice(0, 50) + (getMessageContent(firstUserMessage).length > 50 ? '...' : '')
        : 'New Chat'

      // Create new chat entry
      const newChat: ChatHistory = {
        id: currentChatId,
        title,
        messages,
        timestamp: Date.now()
      }

      // Update localStorage (external system)
      const currentHistory = getChatHistory()
      const updatedHistory = currentHistory.filter(c => c.id !== currentChatId)
      updatedHistory.unshift(newChat)
      const trimmedHistory = updatedHistory.slice(0, 50)
      localStorage.setItem('leads-page-chat-history', JSON.stringify(trimmedHistory))
    }
  }, [messages, currentChatId, showDemo, getMessageContent, getChatHistory])

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      {showSidebar && (
        <div style={{ ...styles.sidebar, width: sidebarCollapsed ? '60px' : '260px' }}>
          <div style={styles.brandHeader}>
            {!sidebarCollapsed && (
              <div style={styles.brandLogo}>
                {settings.logo ? (
                  <Image src={settings.logo} alt="Logo" width={120} height={40} style={{ maxWidth: '120px', maxHeight: '40px', objectFit: 'contain' }} />
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

          {/* New Chat Button */}
          <Button
            variant="ghost"
            style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start', gap: 'var(--op-space-small)', marginTop: 20, border: '1px dashed var(--op-color-border)' }}
            onClick={handleNewChat}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={20} /> {!sidebarCollapsed && 'New chat'}
          </Button>

          {/* Chat History List */}
          {!sidebarCollapsed && chatHistory.length > 0 && (
            <div style={{
              marginTop: 'var(--op-space-medium)',
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--op-space-2x-small)'
            }}>
              {chatHistory.map((chat) => (
                <Button
                  key={chat.id}
                  variant="ghost"
                  style={{
                    justifyContent: 'flex-start',
                    fontSize: 'var(--op-font-x-small)',
                    padding: 'var(--op-space-small)',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',

                    backgroundColor: currentChatId === chat.id ? 'var(--op-color-primary-minus-eight)' : 'transparent'
                  }}
                  onClick={() => handleSwitchChat(chat.id)}
                >
                  {chat.title}
                </Button>
              ))}
            </div>
          )}

          {/* Custom Buttons at bottom */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--op-space-small)' }}>
            {!sidebarCollapsed && (
              <>
                <Button variant="secondary" style={{ width: '100%' }}>
                  rolemodelsoftware.com
                </Button>

                {/* Custom Buttons */}
                {customButtons.map((button) => (
                  <div key={button.id} style={{ position: 'relative' }}>
                    {editMode ? (
                      <>
                        {/* Action buttons absolutely positioned */}
                        {editingButtonId === button.id && (
                          <div style={{
                            position: 'absolute',
                            top: '-44px',
                            right: '0',
                            display: 'flex',
                            gap: 'var(--op-space-x-small)',
                            zIndex: 10,
                          }}>
                            <Button
                              variant="icon"
                              onClick={() => handleDeleteCustomButton(button.id)}
                            >
                              <HugeiconsIcon icon={Delete02Icon} size={16} />
                            </Button>
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
                                <Button variant="icon">
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
                                      margin: 0,
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
                          </div>
                        )}

                        {/* Button with outline when selected */}
                        <Button
                          variant="secondary"
                          style={{
                            width: '100%',
                            outline: editingButtonId === button.id ? '2px solid var(--op-color-primary-base)' : 'none',
                            outlineOffset: '2px',
                          }}
                          onClick={() => handleOpenEditPopover(button)}
                        >
                          {button.text}
                        </Button>
                      </>
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
        {showDemo ? (
          <div style={styles.hero}>
            <div style={{ width: 56, height: 56, fontSize: 28, borderRadius: 12, backgroundColor: settings.favicon ? 'transparent' : 'var(--op-color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {settings.favicon ? (
                <Image src={settings.favicon} alt="Favicon" width={56} height={56} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                'R'
              )}
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 'var(--op-space-x-small)' }}>{settings.pageTitle}</h2>
              <p style={{ fontSize: 'var(--op-font-small)', color: 'var(--op-color-neutral-on-plus-max)', margin: 0 }}>{settings.pageDescription}</p>
            </div>

            {/* Animated Conversation Demo */}
            <AnimatedConversationDemo onInterrupt={() => setShowDemo(false)} />

            {/* Suggestions */}
            <div style={{ display: 'flex', gap: 'var(--op-space-small)', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} style={{ position: 'relative' }}>
                  {/* Action buttons absolutely positioned above selected suggestion */}
                  {editMode && suggestion.isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '-44px',
                      right: '0',
                      display: 'flex',
                      gap: 'var(--op-space-x-small)',
                      zIndex: 10,
                    }}>
                      <Button
                        variant="icon"
                        onClick={() => handleDeleteSuggestion(suggestion.id)}
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={16} />
                      </Button>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="icon">
                            <HugeiconsIcon icon={Settings02Icon} size={16} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" style={{ width: '300px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--op-space-medium)' }}>
                            <div>
                              <Label style={{
                                display: 'block',
                                marginBottom: 'var(--op-space-x-small)',
                                fontSize: 'var(--op-font-small)',
                              }}>
                                Suggestion text
                              </Label>
                              <Input
                                autoFocus
                                value={suggestion.text}
                                onChange={(e) => handleSuggestionTextChange(suggestion.id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    const popover = (e.target as HTMLElement).closest('[data-radix-popper-content-wrapper]')
                                    if (popover) {
                                      const trigger = document.querySelector(`[data-state="open"]`) as HTMLElement
                                      trigger?.click()
                                    }
                                  }
                                }}
                                placeholder="What types of software do you build?"
                              />
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  {/* Suggestion pill */}
                  <Button
                    variant="pill"
                    onClick={() => {
                      if (editMode) {
                        handleSelectSuggestion(suggestion.id)
                      } else {
                        handlePromptSubmit({ text: suggestion.text, files: [] })
                      }
                    }}
                    style={{
                      outline: editMode && suggestion.isSelected ? '2px solid var(--op-color-primary-base)' : 'none',
                      outlineOffset: '2px',
                    }}
                  >
                    {suggestion.text}
                  </Button>
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
            {/* Conversation Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: 'var(--op-space-large)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--op-space-medium)',
            }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '75%',
                      padding: 'var(--op-space-medium)',
                      borderRadius: 'var(--op-radius-medium)',
                      backgroundColor: message.role === 'user'
                        ? 'var(--op-color-primary-base)'
                        : 'var(--op-color-neutral-plus-six)',
                      color: message.role === 'user'
                        ? 'var(--op-color-primary-on-base)'
                        : 'var(--op-color-on-background)',
                      fontSize: 'var(--op-font-small)',
                      lineHeight: 1.5,
                      textAlign: 'left',
                      whiteSpace: 'pre-line',
                      boxShadow: message.role === 'user'
                        ? '0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        : '0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 1px 3px -1px rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    {getMessageContent(message)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: 'var(--op-space-large)', paddingTop: 0 }}>
              <PromptInputProvider>
                <PromptInput onSubmit={handlePromptSubmit}>
                  <PromptInputAttachments>
                    {(attachment) => <PromptInputAttachment key={attachment.id} data={attachment} />}
                  </PromptInputAttachments>
                  <PromptInputBody>
                    <PromptInputTextarea placeholder="Ask me anything..." ref={textareaRef} />
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
            </div>
          </>
        )}
      </div>
    </div>
  )
}
