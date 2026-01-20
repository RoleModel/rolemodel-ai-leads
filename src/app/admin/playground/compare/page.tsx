'use client'

import { useChat } from '@ai-sdk/react'
import {
  Add01Icon,
  ArrowLeft01Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  Delete02Icon,
  Globe02Icon,
  MoreVerticalIcon,
  RefreshIcon,
  Settings02Icon,
  Tick01Icon,
} from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import { DefaultChatTransport, type UIMessage, isTextUIPart } from 'ai'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Conversation, ConversationContent } from '@/components/ai-elements/conversation'
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'

import { AVAILABLE_MODELS } from '@/lib/ai/models'

interface ChatInstance {
  id: string
  model: string
  temperature: number
}

function ChatInstanceComponent({
  instance,
  index,
  totalInstances,
  syncEnabled,
  syncMessage,
  onDelete,
  onModelChange,
  onTemperatureChange,
  onSyncToggle,
  onSendMessage,
}: {
  instance: ChatInstance
  index: number
  totalInstances: number
  syncEnabled: boolean
  syncMessage: string | null
  onDelete: (id: string) => void
  onModelChange: (id: string, model: string) => void
  onTemperatureChange: (id: string, temperature: number) => void
  onSyncToggle?: (enabled: boolean) => void
  onSendMessage?: (message: string) => void
}) {
  const [modelSearch, setModelSearch] = useState('')

  const currentModel =
    AVAILABLE_MODELS.find((m) => m.id === instance.model) || AVAILABLE_MODELS[0]

  const filteredModels = AVAILABLE_MODELS.filter(
    (model) =>
      model.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      model.provider.toLowerCase().includes(modelSearch.toLowerCase())
  )

  const chatTransport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: {
          chatbotId: 'a0000000-0000-0000-0000-000000000001',
        },
      }),
    []
  )
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { messages, sendMessage, status, setMessages } = useChat<UIMessage>({
    transport: chatTransport,
  })

  // Handle synced messages from other instances
  const lastSyncMessageRef = useRef<string | null>(null)
  useEffect(() => {
    if (syncMessage && syncMessage !== lastSyncMessageRef.current) {
      lastSyncMessageRef.current = syncMessage
      sendMessage({ text: syncMessage }).catch((error) => {
        console.error('Error sending synced message:', error)
      })
    }
  }, [syncMessage, sendMessage])

  const handlePromptSubmit = async (message: { text: string; files: unknown[] }) => {
    if (!message.text.trim()) return

    try {
      // If sync is enabled and we have a callback, broadcast to other instances
      if (syncEnabled && onSendMessage) {
        onSendMessage(message.text)
      } else {
        await sendMessage({
          text: message.text,
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleClearChat = () => {
    setMessages([])
  }

  const getMessageContent = (message: UIMessage) => {
    const textParts = message.parts.filter(isTextUIPart)
    return textParts.map((part) => part.text).join('\n')
  }

  const isStreaming = status === 'streaming'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRight:
          index < totalInstances - 1 ? '1px solid var(--op-color-border)' : 'none',
        overflow: 'hidden',
        backgroundColor: 'var(--op-color-background)',
        position: 'relative',
      }}
    >
      {/* Instance Header */}
      <div
        style={{
          padding: 'var(--op-space-medium)',
          borderBottom: '1px solid var(--op-color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--op-space-small)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--op-space-small)',
            flex: 1,
          }}
        >
          {/* Model Logo and Name */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--op-space-2x-small)',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                src={currentModel.logo}
                alt={currentModel.name}
                width={24}
                height={24}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <span
              style={{
                fontSize: 'var(--op-font-small)',
                fontWeight: 'var(--op-font-weight-medium)',
              }}
            >
              {currentModel.name}
            </span>
          </div>

          {index === 0 && onSyncToggle && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--op-space-small)',
                marginLeft: 'auto',
              }}
            >
              <span style={{ fontSize: 'var(--op-font-small)' }}>Sync</span>
              <Switch checked={syncEnabled} onCheckedChange={onSyncToggle} />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--op-space-2x-small)' }}>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghosticon">
                <HugeiconsIcon icon={Settings02Icon} size={20} />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              style={{ width: '400px', maxHeight: '80vh', overflowY: 'auto' }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--op-space-medium)',
                }}
              >
                <div>
                  <Label
                    htmlFor={`compare-model-search-${instance.id}`}
                    style={{
                      marginBottom: 'var(--op-space-small)',
                      display: 'block',
                      fontSize: 'var(--op-font-small)',
                      fontWeight: 'var(--op-font-weight-medium)',
                    }}
                  >
                    Model
                  </Label>

                  {/* Search Input */}
                  <input
                    name={`compare-model-search-${instance.id}`}
                    id={`compare-model-search-${instance.id}`}
                    type="text"
                    className="form-control"
                    placeholder="Search models..."
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    style={{ marginBottom: 'var(--op-space-small)' }}
                    role="combobox"
                    aria-expanded={filteredModels.length > 0}
                    aria-controls={`compare-model-list-${instance.id}`}
                  />

                  {/* Model List */}
                  <div
                    id={`compare-model-list-${instance.id}`}
                    role="listbox"
                    style={{
                      border: '1px solid var(--op-color-border)',
                      borderRadius: 'var(--op-radius-medium)',
                      maxHeight: '300px',
                      overflowY: 'auto',
                    }}
                  >
                    {filteredModels.map((model) => (
                      <Button
                        variant="ghost"
                        key={model.id}
                        onClick={() => {
                          onModelChange(instance.id, model.id)
                          setModelSearch('')
                        }}
                        style={{
                          width: '100%',
                          padding: 'var(--op-space-small)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--op-space-small)',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '0',
                          borderBottom: '1px solid var(--op-color-border)',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => {
                          if (instance.model !== model.id) {
                            e.currentTarget.style.backgroundColor =
                              'var(--op-color-neutral-plus-six)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (instance.model !== model.id) {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }
                        }}
                      >
                        <Image
                          src={model.logo}
                          alt={model.name}
                          width={20}
                          height={20}
                          style={{ objectFit: 'contain', flexShrink: 0 }}
                        />
                        <span style={{ flex: 1 }}>{model.name}</span>
                        {instance.model === model.id && (
                          <HugeiconsIcon icon={Tick01Icon} size={20} />
                        )}
                      </Button>
                    ))}
                    {filteredModels.length === 0 && (
                      <div
                        style={{
                          padding: 'var(--op-space-large)',
                          textAlign: 'center',
                          fontSize: 'var(--op-font-small)',
                        }}
                      >
                        No models found
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 'var(--op-space-small)',
                    }}
                  >
                    <Label
                      htmlFor={`compare-temperature-${instance.id}`}
                      style={{
                        fontSize: 'var(--op-font-small)',
                        fontWeight: 'var(--op-font-weight-medium)',
                      }}
                    >
                      Temperature
                    </Label>
                    <span
                      style={{
                        fontSize: 'var(--op-font-small)',
                        fontWeight: 'var(--op-font-weight-bold)',
                      }}
                    >
                      {instance.temperature}
                    </span>
                  </div>
                  <input
                    id={`compare-temperature-${instance.id}`}
                    type="range"
                    min="0"
                    max="100"
                    value={instance.temperature}
                    onChange={(e) =>
                      onTemperatureChange(instance.id, Number(e.target.value))
                    }
                    style={{ width: '100%' }}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={instance.temperature}
                  />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 'var(--op-font-x-small)',
                      marginTop: 'var(--op-space-2x-small)',
                    }}
                  >
                    <span>Reserved</span>
                    <span>Creative</span>
                  </div>
                </div>

                <div>
                  <Label
                    style={{
                      marginBottom: 'var(--op-space-small)',
                      display: 'block',
                      fontSize: 'var(--op-font-small)',
                      fontWeight: 'var(--op-font-weight-medium)',
                    }}
                  >
                    AI Actions
                  </Label>
                  <div
                    style={{
                      padding: 'var(--op-space-large)',
                      border: '1px solid var(--op-color-border)',
                      borderRadius: 'var(--op-radius-medium)',
                      textAlign: 'center',
                      color: 'var(--op-color-on-background)',
                      fontSize: 'var(--op-font-small)',
                    }}
                  >
                    No actions found
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 'var(--op-space-small)',
                    }}
                  >
                    <Label
                      htmlFor={`compare-instructions-${instance.id}`}
                      style={{
                        fontSize: 'var(--op-font-small)',
                        fontWeight: 'var(--op-font-weight-medium)',
                      }}
                    >
                      Instructions (System prompt)
                    </Label>
                    <Button variant="secondary">
                      <HugeiconsIcon icon={RefreshIcon} size={20} />
                    </Button>
                  </div>
                  <select
                    id={`compare-instructions-${instance.id}`}
                    className="form-control"
                    defaultValue="base"
                  >
                    <option value="base">Base Instructions</option>
                    <option value="custom">Custom Instructions</option>
                  </select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghosticon">
                <HugeiconsIcon icon={MoreVerticalIcon} size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <HugeiconsIcon icon={ArrowLeft02Icon} size={20} />
                Move left
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HugeiconsIcon icon={ArrowRight02Icon} size={20} />
                Move right
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleClearChat}>
                <HugeiconsIcon icon={RefreshIcon} size={20} />
                Clear chat
              </DropdownMenuItem>
              {totalInstances > 1 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(instance.id)}
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={20} />
                    Delete agent
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghosticon">
            <HugeiconsIcon icon={Tick01Icon} size={20} />
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--op-space-large)',
        }}
      >
        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  fontSize: 'var(--op-font-small)',
                }}
              >
                No messages yet
              </div>
            ) : (
              messages.map((message) => (
                <Message
                  key={message.id}
                  from={message.role === 'user' ? 'user' : 'assistant'}
                >
                  <MessageContent>
                    <MessageResponse>{getMessageContent(message)}</MessageResponse>
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>
        </Conversation>
      </div>

      {/* Input */}
      <div
        style={{
          padding: 'var(--op-space-large)',
          borderTop: '1px solid var(--op-color-border)',
        }}
      >
        <PromptInputProvider>
          <PromptInput onSubmit={handlePromptSubmit} style={{ width: '100%' }}>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputBody>
              <PromptInputTextarea placeholder="Ask me anything..." />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
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
    </div>
  )
}

export default function ComparePage() {
  const router = useRouter()
  const [instances, setInstances] = useState<ChatInstance[]>([
    {
      id: '1',
      model: 'claude-3.5-sonnet',
      temperature: 0,
    },
    {
      id: '2',
      model: 'gpt-4o',
      temperature: 0,
    },
  ])
  const [syncEnabled, setSyncEnabled] = useState(true)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const syncMessageIdRef = useRef(0)

  // Broadcast message to all instances
  const handleSyncMessage = (message: string) => {
    syncMessageIdRef.current += 1
    // Append a unique ID to force re-trigger even for same message
    setSyncMessage(`${message}::${syncMessageIdRef.current}`)
  }

  // Extract just the message text from sync message (remove the ID suffix)
  const cleanSyncMessage = syncMessage ? syncMessage.split('::')[0] : null

  const handleClearAll = () => {
    window.location.reload()
  }

  const handleReset = () => {
    setInstances([
      {
        id: '1',
        model: 'claude-3-haiku',
        temperature: 0,
      },
      {
        id: '2',
        model: 'claude-3-haiku',
        temperature: 0,
      },
    ])
  }

  const handleAddInstance = () => {
    const newInstance: ChatInstance = {
      id: Date.now().toString(),
      model: 'claude-3.5-sonnet',
      temperature: 0,
    }
    setInstances((prev) => [...prev, newInstance])
  }

  const handleDeleteInstance = (instanceId: string) => {
    setInstances((prev) => prev.filter((instance) => instance.id !== instanceId))
  }

  const handleModelChange = (instanceId: string, model: string) => {
    setInstances((prev) =>
      prev.map((instance) => {
        if (instance.id === instanceId) {
          return { ...instance, model }
        }
        return instance
      })
    )
  }

  const handleTemperatureChange = (instanceId: string, temperature: number) => {
    setInstances((prev) =>
      prev.map((instance) => {
        if (instance.id === instanceId) {
          return { ...instance, temperature }
        }
        return instance
      })
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: 'var(--op-color-background)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 'var(--op-space-large)',
          borderBottom: '1px solid var(--op-color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--op-space-medium)' }}
        >
          <Button variant="ghost" onClick={() => router.push('/admin/playground')}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
            <span>Back to Playground</span>
          </Button>
          <h1
            style={{
              fontSize: 'var(--op-font-x-large)',
              fontWeight: 'var(--op-font-weight-bold)',
              margin: 0,
            }}
          >
            Compare
          </h1>
        </div>

        <div
          style={{ display: 'flex', gap: 'var(--op-space-small)', alignItems: 'center' }}
        >
          <Button variant="secondary" onClick={handleClearAll}>
            Clear all chats
          </Button>
          <Button variant="secondary" onClick={handleReset}>
            <HugeiconsIcon icon={RefreshIcon} size={20} />
            <span>Reset</span>
          </Button>
          <Button variant="secondary" onClick={handleAddInstance}>
            <HugeiconsIcon icon={Add01Icon} size={20} />
            <span>Add an instance</span>
          </Button>
        </div>
      </div>

      {/* Chat Instances */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: `repeat(${instances.length}, 1fr)`,
          gap: 0,
          overflow: 'hidden',
        }}
      >
        {instances.map((instance, index) => (
          <ChatInstanceComponent
            key={instance.id}
            instance={instance}
            index={index}
            totalInstances={instances.length}
            syncEnabled={syncEnabled}
            syncMessage={syncEnabled ? cleanSyncMessage : null}
            onDelete={handleDeleteInstance}
            onModelChange={handleModelChange}
            onTemperatureChange={handleTemperatureChange}
            onSyncToggle={setSyncEnabled}
            onSendMessage={syncEnabled ? handleSyncMessage : undefined}
          />
        ))}
      </div>
    </div>
  )
}
