'use client'

import { useChat } from '@ai-sdk/react'
import {
  Delete02Icon,
  Moon02Icon,
  PlusSignIcon,
  Settings02Icon,
  SidebarLeftIcon,
  Sun01Icon,
} from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import { TextStreamChatTransport, type UIMessage, isTextUIPart } from 'ai'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputProvider,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input'
import { AnimatedConversationDemo } from '@/components/leads-page/AnimatedConversationDemo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { useLeadsPageSettings } from '@/contexts/LeadsPageSettingsContext'

interface Suggestion {
  id: string
  text: string
  isSelected?: boolean
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
  theme?: 'light' | 'dark'
  onThemeChange?: (theme: 'light' | 'dark') => void
  isEmbed?: boolean
}

const styles = {
  container: {
    display: 'flex',
    backgroundColor: 'var(--op-color-neutral-plus-seven)',
    height: '100vh',
    width: '100%',
    overflow: 'auto',
  },
  sidebar: {
    '--_op-sidebar-background-color': 'var(--op-color-neutral-plus-seven)',
    '--_op-sidebar-rail-width': 'calc(var(--op-space-scale-unit) * 6)',
    '--_op-sidebar-drawer-width': 'calc(var(--op-space-scale-unit) * 30)',

    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center' as const,
    padding: 'var(--op-space-medium)',
    transition: 'width 0.2s ease',
  },
  brandHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 'var(--op-space-large)',
  },
  brandLogo: {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    gap: 'var(--op-space-small)',
  },
  logoImage: {
    maxWidth: '120px',
    maxHeight: '40px',
    objectFit: 'contain' as const,
  },
  brandNamePrimary: {
    fontWeight: 'bold' as const,
    color: 'var(--op-color-primary-base)',
    fontSize: 15,
  },
  brandNameSecondary: {
    fontSize: 11,
    color: 'var(--op-color-neutral-on-plus-max)',
  },
  newChatButton: {
    justifyContent: 'center' as const,
    gap: 'var(--op-space-small)',
    marginTop: 20,
    border: '1px dashed var(--op-color-border)',
    minWidth: 0,
    boxShadow: 'none'
  },
  exportButton: {
    justifyContent: 'center' as const,
    gap: 'var(--op-space-small)',
    width: '100%',
  },
  chatHistoryList: {
    marginTop: 'var(--op-space-medium)',
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--op-space-2x-small)',
  },
  chatHistoryItem: {
    justifyContent: 'flex-start' as const,
    fontSize: 'var(--op-font-x-small)',
    padding: 'var(--op-space-small)',
    textAlign: 'left' as const,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  },
  customButtonsContainer: {
    marginTop: 'var(--op-space-medium)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--op-space-small)',
  },
  customButtonWrapper: {
    position: 'relative' as const,
  },
  customButtonActions: {
    position: 'absolute' as const,
    top: '-44px',
    right: '0',
    display: 'flex',
    gap: 'var(--op-space-x-small)',
    zIndex: 10,
  },
  popoverContent: {
    width: '400px',
  },
  popoverHeader: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--op-space-medium)',
  },
  popoverTitle: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  popoverTitleText: {
    fontSize: 'var(--op-font-medium)',
    fontWeight: 600,
    margin: 0,
  },
  closeButton: {
    fontSize: '20px',
  },
  inputLabel: {
    display: 'block' as const,
    marginBottom: 'var(--op-space-x-small)',
    fontSize: 'var(--op-font-small)',
  },
  urlInputGroup: {
    display: 'flex',
    gap: 0,
  },
  urlPrefix: {
    padding: 'var(--op-space-small) var(--op-space-medium)',
    backgroundColor: 'var(--op-color-neutral-plus-eight)',
    border: '1px solid var(--op-color-border)',
    borderRight: 'none',
    borderTopLeftRadius: 'var(--op-radius-medium)',
    borderBottomLeftRadius: 'var(--op-radius-medium)',
    fontSize: 'var(--op-font-small)',
    color: 'var(--op-color-on-background)',
  },
  urlInput: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  customButtonFull: {
    width: '100%',
  },
  customButtonWithOutline: {
    width: '100%',
  },
  addButtonContainer: {
    justifyContent: 'flex-start' as const,
    gap: 'var(--op-space-small)',
    width: '100%',
    border: '1px dashed var(--op-color-border)',
  },
  darkModeToggleContainer: {
    width: '100%',
    marginTop: 'auto' as const,
    display: 'flex',
    justifyContent: 'flex-end' as const,
    alignItems: 'flex-end' as const,
  },
  darkModeToggle: {
    justifyContent: 'flex-end' as const,
    gap: 'var(--op-space-small)',
  },
  content: {
    flex: 1,
    display: 'flex',
    width: '100%',
    flexDirection: 'column' as const,
    overflow: 'auto',
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
    height: '100%',
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--op-space-large)',
    padding: 'var(--op-space-3x-large)',
    textAlign: 'center' as const,
    flex: 1,
    height: '100%',
  },
  favicon: {
    width: 56,
    height: 56,
    fontSize: 28,
    borderRadius: 12,
    backgroundColor: 'var(--op-color-primary)',
    color: 'white',
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
  },
  faviconImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  pageTitle: {
    fontSize: 'var(--op-font-3x-large)',
    fontWeight: 700,
    marginBottom: 'var(--op-space-x-small)',
  },
  pageDescription: {
    fontSize: 'var(--op-font-small)',
    color: 'var(--op-color-neutral-on-plus-max)',
    margin: 0,
  },
  suggestionsContainer: {
    display: 'flex',
    gap: 'var(--op-space-small)',
    flexWrap: 'nowrap' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  suggestionWrapper: {
    position: 'relative' as const,
  },
  suggestionActions: {
    position: 'absolute' as const,
    top: '-44px',
    right: '0',
    display: 'flex',
    gap: 'var(--op-space-x-small)',
    zIndex: 10,
  },
  suggestionPopover: {
    width: '300px',
  },
  suggestionPopoverContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--op-space-medium)',
  },
  suggestionWithOutline: {
    outline: 'none' as const,
    outlineOffset: '2px',
  },
  chatContainer: {
    // flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    paddingTop: 'var(--op-space-3x-large)',
    paddingRight: 'var(--op-space-3x-large)',
    paddingBottom: 'var(--op-space-large)',
    paddingLeft: 'var(--op-space-3x-large)',
  },
  chatHeader: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    gap: 'var(--op-space-large)',
    marginBottom: 'var(--op-space-large)',
  },
  chatHeaderCenter: {
    textAlign: 'center' as const,
  },
  bantProgressContainer: {
    width: '100%',
    maxWidth: '600px',
    display: 'flex',
    alignItems: 'center' as const,
    gap: 'var(--op-space-small)',
    marginBottom: 'var(--op-space-medium)',
    padding: '0 var(--op-space-small)',
  },
  bantProgressBar: {
    flex: 1,
    height: 'var(--op-space-x-small)',
    backgroundColor: 'var(--op-color-neutral-plus-six)',
    borderRadius: 'var(--op-radius-pill)',
    overflow: 'hidden' as const,
  },
  bantProgressFill: {
    height: '100%',
    backgroundColor: 'var(--op-color-primary-base)',
    borderRadius: 'var(--op-radius-pill)',
    transition: 'width 0.5s ease-out',
  },
  bantProgressText: {
    fontSize: 'var(--op-font-small)',
    fontWeight: 600,
    color: 'var(--op-color-neutral-on-plus-max)',
    minWidth: '38px',
    textAlign: 'right' as const,
  },
  messagesOuterContainer: {
    width: '100%',
    maxWidth: '700px',
    height: '100%',
    display: 'flex',
    justifyContent: 'start',
    flexGrow: '1',
    flexDirection: 'column' as const,
  },
  messagesInnerContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--op-space-small)',
    height: '400px',
    flexGrow: '1',
    flexShrink: '0',
    overflowY: 'auto' as const,
    paddingInline: 'var(--op-space-small)',
  },
  messageWrapper: {
    display: 'flex',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 'var(--op-space-small)',
    borderRadius: 'var(--op-radius-medium)',
    fontSize: 'var(--op-font-small)',
    lineHeight: 1.4,
    textAlign: 'left' as const,
    whiteSpace: 'pre-line' as const,
  },
  suggestionsAtBottom: {
    display: 'flex',
    gap: 'var(--op-space-small)',
    flexWrap: 'wrap' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingTop: 'var(--op-space-medium)',
    paddingBottom: 'var(--op-space-medium)',
  },
  inputContainer: {
    paddingTop: 'var(--op-space-medium)',
    position: 'relative' as const,
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
  sidebarDynamic: {
    padding: 'var(--op-space-medium)',
  },
  sidebarCollapsed: {
    padding: 'var(--op-space-small)',
  },
  buttonActionsContainer: {
    position: 'absolute' as const,
    top: '-44px',
    right: '0',
    display: 'flex',
    gap: 'var(--op-space-x-small)',
    zIndex: 10,
  },
  popoverInnerContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--op-space-medium)',
  },
  popoverHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  popoverHeaderTitle: {
    fontSize: 'var(--op-font-medium)',
    fontWeight: 600,
    margin: 0,
    color: 'var(--op-color-on-background)',
  },
  closeButtonText: {
    fontSize: 'var(--op-font-x-large)',
  },
  labelBlock: {
    display: 'block' as const,
    marginBottom: 'var(--op-space-x-small)',
    fontSize: 'var(--op-font-small)',
  },
  urlInputWrapper: {
    display: 'flex',
    gap: 0,
  },
  httpsPrefix: {
    paddingBlock: 'var(--op-space-2x-small)',
    paddingInline: 'var(--op-space-small) var(--op-space-x-small)',
    backgroundColor: 'var(--op-color-neutral-plus-eight)',
    border: '1px solid var(--op-color-border)',
    borderRight: 'none',
    borderTopLeftRadius: 'var(--op-radius-medium)',
    borderBottomLeftRadius: 'var(--op-radius-medium)',
    fontSize: 'var(--op-font-small)',
    color: 'var(--op-color-on-background)',
    height: 'var(--op-input-height-large)',
    display: 'flex',
    alignItems: 'center',
  },
  urlInputField: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonOutlined: {
    outline: '2px solid var(--op-color-primary-base)' as const,
    outlineOffset: '2px',
  },
  buttonNoOutline: {
    outline: 'none' as const,
    outlineOffset: '2px',
  },
  chatHistoryContainer: {
    marginTop: 'var(--op-space-medium)',
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--op-space-2x-small)',
  },
  faviconDynamic: {
    width: 56,
    height: 56,
    fontSize: 28,
    borderRadius: 'var(--op-radius-medium)',
    color: 'white',
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
  },
  faviconWithBackground: {
    backgroundColor: 'var(--op-color-primary)',
  },
  faviconTransparent: {
    backgroundColor: 'transparent',
  },

  headerSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    gap: 'var(--op-space-large)',
    marginBottom: 'var(--op-space-large)',
  },
  textCenter: {
    textAlign: 'center' as const,
  },
  messageBubbleUser: {
    backgroundColor: 'var(--op-color-primary-base)',
    color: 'var(--op-color-primary-on-base)',
    boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  messageBubbleAssistant: {
    backgroundColor: 'var(--op-color-neutral-plus-six)',
    color: 'var(--op-color-on-background)',
    boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 1px 3px -1px rgba(0, 0, 0, 0.04)',
  },
  messageWrapperUser: {
    justifyContent: 'flex-end' as const,
  },
  messageWrapperAssistant: {
    justifyContent: 'flex-start' as const,
  },
}

const DEFAULT_SUGGESTIONS: Suggestion[] = [
  { id: '1', text: 'What types of software do you build?' },
  { id: '2', text: 'How long does a project typically take?' },
]

export function LeadsPageView({
  chatbotId,
  showSidebar = true,
  editMode = false,
  theme,
  onThemeChange,
  isEmbed = false,
}: LeadsPageViewProps) {
  const { settings } = useLeadsPageSettings()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>(DEFAULT_SUGGESTIONS)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Chat history - use state to avoid hydration mismatch
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [currentChatId, setCurrentChatId] = useState<string>(() => `chat-${Date.now()}`)
  const [showDemo, setShowDemo] = useState(true)

  // Load chat history from localStorage only on client (runs once on mount)
  useEffect(() => {
    const loadChatHistory = () => {
      const saved = localStorage.getItem('leads-page-chat-history')
      if (saved) {
        try {
          const history = JSON.parse(saved)
          setChatHistory(history)
          // Only hide demo based on chat history if in embed mode
          if (isEmbed) {
            setShowDemo(history.length === 0)
          }
        } catch {
          setChatHistory([])
          setShowDemo(true)
        }
      } else {
        setChatHistory([])
        setShowDemo(true)
      }
    }
    loadChatHistory()
  }, [isEmbed])


  const chatTransport = useMemo(
    () =>
      new TextStreamChatTransport<UIMessage>({
        api: '/api/chat',
        body: {
          chatbotId,
        },
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: {
            ...body,
            messages: messages.map((msg) => ({
              role: msg.role,
              content: msg.parts
                .filter((part) => part.type === 'text')
                .map((part) => (part as { type: 'text'; text: string }).text)
                .join('\n'),
            })),
          },
        }),
      }),
    [chatbotId]
  )

  const { messages, sendMessage, status, setMessages } = useChat<UIMessage>({
    transport: chatTransport,
  })

  const handlePromptSubmit = async (message: PromptInputMessage) => {
    if (!message.text.trim()) return
    setShowDemo(false)

    // Check if this was triggered by a suggestion click
    const isSuggestionClick = suggestions.some((s) => s.text === message.text)
    if (isSuggestionClick) {
      setShowSuggestions(false)
    }

    await sendMessage({
      text: message.text,
    })
  }

  const getMessageContent = useCallback((message: UIMessage) => {
    const textParts = message.parts.filter(isTextUIPart)
    return textParts.map((part) => part.text).join('\n')
  }, [])

  const isStreaming = status === 'streaming'

  // Calculate BANT progress from conversation
  const calculateBANTProgress = useCallback(() => {
    const conversationText = messages
      .map((m) => getMessageContent(m).toLowerCase())
      .join(' ')

    let completedSteps = 0
    const totalSteps = 5 // Name, Email, Need, Timeline, Budget/Authority

    // Check for name (simple heuristic)
    if (conversationText.includes("i'm ") || conversationText.includes('my name is')) {
      completedSteps++
    }

    // Check for email
    if (conversationText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)) {
      completedSteps++
    }

    // Check for need/problem discussion
    if (
      conversationText.includes('challenge') ||
      conversationText.includes('problem') ||
      conversationText.includes('need') ||
      conversationText.includes('issue')
    ) {
      completedSteps++
    }

    // Check for timeline discussion
    if (
      conversationText.match(/\d+\s*(month|week|day|year)|timeline|when|by\s+\w+\s+\d+/i)
    ) {
      completedSteps++
    }

    // Check for budget OR authority discussion
    if (
      conversationText.match(/\$|budget|cost|price|decision|ceo|cto|founder|manager/i)
    ) {
      completedSteps++
    }

    return Math.round((completedSteps / totalSteps) * 100)
  }, [messages, getMessageContent])

  const bantProgress = messages.length > 0 ? calculateBANTProgress() : 0


  // Suggestion handlers
  const handleAddSuggestion = () => {
    const newSuggestion: Suggestion = {
      id: `suggestion-${Date.now()}`,
      text: 'Suggestion',
      isSelected: true,
    }
    setSuggestions([
      ...suggestions.map((s) => ({ ...s, isSelected: false })),
      newSuggestion,
    ])
  }

  const handleDeleteSuggestion = (id: string) => {
    setSuggestions(suggestions.filter((s) => s.id !== id))
  }

  const handleSelectSuggestion = (id: string) => {
    setSuggestions(
      suggestions.map((s) =>
        s.id === id ? { ...s, isSelected: true } : { ...s, isSelected: false }
      )
    )
  }

  const handleSuggestionTextChange = (id: string, text: string) => {
    setSuggestions(suggestions.map((s) => (s.id === id ? { ...s, text } : s)))
  }

  // Chat history handlers
  const handleNewChat = () => {
    // Save current chat if there are messages
    if (messages.length > 0 && currentChatId) {
      const firstUserMessage = messages.find((m) => m.role === 'user')
      const title = firstUserMessage
        ? getMessageContent(firstUserMessage).slice(0, 50) +
        (getMessageContent(firstUserMessage).length > 50 ? '...' : '')
        : 'New Chat'

      const chatToSave: ChatHistory = {
        id: currentChatId,
        title,
        messages,
        timestamp: Date.now(),
      }

      const updatedHistory = chatHistory.filter((c) => c.id !== currentChatId)
      updatedHistory.unshift(chatToSave)
      const trimmedHistory = updatedHistory.slice(0, 50)
      localStorage.setItem('leads-page-chat-history', JSON.stringify(trimmedHistory))
      setChatHistory(trimmedHistory)
    }

    // Create new chat
    setCurrentChatId(`chat-${Date.now()}`)
    setMessages([])
    setShowDemo(true)
  }

  const handleSwitchChat = (chatId: string) => {
    const chat = chatHistory.find((c) => c.id === chatId)
    if (chat) {
      setCurrentChatId(chatId)
      setShowDemo(false)
      // Load the chat's messages
      setMessages(chat.messages)
    }
  }

  // Dark mode handler
  const handleToggleDarkMode = () => {
    if (onThemeChange) {
      const newTheme = theme === 'dark' ? 'light' : 'dark'
      onThemeChange(newTheme)
    }
  }

  // Save current chat to localStorage when messages change (external system sync)
  useEffect(() => {
    if (messages.length > 0 && !showDemo && currentChatId) {
      // Generate title from first user message
      const firstUserMessage = messages.find((m) => m.role === 'user')
      const title = firstUserMessage
        ? getMessageContent(firstUserMessage).slice(0, 50) +
        (getMessageContent(firstUserMessage).length > 50 ? '...' : '')
        : 'New Chat'

      // Create new chat entry
      const newChat: ChatHistory = {
        id: currentChatId,
        title,
        messages,
        timestamp: Date.now(),
      }

      // Read current history from localStorage, update it, and save back
      const saved = localStorage.getItem('leads-page-chat-history')
      let currentHistory: ChatHistory[] = []
      if (saved) {
        try {
          currentHistory = JSON.parse(saved)
        } catch {
          currentHistory = []
        }
      }

      const updatedHistory = currentHistory.filter((c) => c.id !== currentChatId)
      updatedHistory.unshift(newChat)
      const trimmedHistory = updatedHistory.slice(0, 50)
      localStorage.setItem('leads-page-chat-history', JSON.stringify(trimmedHistory))
    }
  }, [messages, currentChatId, showDemo, getMessageContent])

  return (
    <div className="app-with-sidebar" style={{ height: "100%" }}>
      {/* Sidebar */}
      {showSidebar && (
        <div
          className={sidebarCollapsed ? 'sidebar sidebar--rail' : 'sidebar'}
          style={{
            ...styles.sidebar,
            ...(sidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarDynamic),
          }}
        >
          <div style={styles.brandHeader}>
            {!sidebarCollapsed && (
              <div style={styles.brandLogo}>
                {settings.logo ? (
                  <Image
                    src={settings.logo}
                    alt="Logo"
                    width={120}
                    height={40}
                    style={styles.logoImage}
                  />
                ) : (
                  <>
                    <span style={styles.brandNamePrimary}>RoleModel</span>
                    <span style={styles.brandNameSecondary}>software</span>
                  </>
                )}
              </div>
            )}

            <Button
              style={{ justifySelf: 'center' }}
              variant="ghosticon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <HugeiconsIcon icon={SidebarLeftIcon} size={20} />
            </Button>
          </div>



          {/* New Chat Button */}
          <Button
            variant={!sidebarCollapsed ? 'secondary' : 'icon'}
            style={{
              ...styles.newChatButton,
            }}
            onClick={handleNewChat}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={20} />{' '}
            {!sidebarCollapsed && 'New chat'}
          </Button>

          {/* Chat History List */}
          {!sidebarCollapsed && chatHistory.length > 0 && (
            <div style={styles.chatHistoryContainer}>
              {chatHistory.map((chat) => (
                <Button
                  key={chat.id}
                  variant="secondary"
                  style={{
                    justifyContent: 'flex-start',
                    padding: 'var(--op-space-small)',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minWidth: 0,
                    width: '100%',
                  }}
                  onClick={() => handleSwitchChat(chat.id)}
                >
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block',
                      width: '100%',
                    }}
                  >
                    {chat.title.trim()}
                  </span>
                </Button>
              ))}
            </div>
          )}





          {/* Dark Mode Toggle at bottom */}
          <div style={styles.darkModeToggleContainer}>
            <Button
              variant="ghosticon"
              style={styles.darkModeToggle}
              onClick={handleToggleDarkMode}
            >
              <HugeiconsIcon icon={theme === 'dark' ? Sun01Icon : Moon02Icon} size={20} />
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="app__content">
        {showDemo ? (
          <div style={styles.hero}>

            <div>
              <h2 style={styles.pageTitle}>
                {settings.pageTitle}
              </h2>
              <p style={styles.pageDescription}>
                {settings.pageDescription}
              </p>
            </div>

            {/* Animated Conversation Demo */}
            <AnimatedConversationDemo onInterrupt={() => setShowDemo(false)} />

            {/* Suggestions */}
            <div style={styles.suggestionsContainer}>
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} style={styles.suggestionWrapper}>
                  {/* Action buttons absolutely positioned above selected suggestion */}
                  {editMode && suggestion.isSelected && (
                    <div style={styles.suggestionActions}>
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
                        <PopoverContent align="end" style={styles.suggestionPopover}>
                          <div style={styles.suggestionPopoverContent}>
                            <div>
                              <Label style={styles.labelBlock}>
                                Suggestion text
                              </Label>
                              <Input
                                autoFocus
                                value={suggestion.text}
                                onChange={(e) =>
                                  handleSuggestionTextChange(
                                    suggestion.id,
                                    e.target.value
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    const popover = (e.target as HTMLElement).closest(
                                      '[data-radix-popper-content-wrapper]'
                                    )
                                    if (popover) {
                                      const trigger = document.querySelector(
                                        `[data-state="open"]`
                                      ) as HTMLElement
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
                    style={editMode && suggestion.isSelected ? styles.buttonOutlined : styles.buttonNoOutline}
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
          <div style={styles.heroSection}>
            {/* Header with Favicon, Title, and Description */}
            <div style={styles.headerSection}>
              <div style={styles.textCenter}>
                <h2 style={styles.pageTitle}>
                  {settings.pageTitle}
                </h2>
                <p style={styles.pageDescription}>
                  {settings.pageDescription}
                </p>
              </div>
            </div>

            {/* BANT Progress Indicator */}
            {bantProgress < 100 && (
              <div style={styles.bantProgressContainer}>
                <div style={styles.bantProgressBar}>
                  <div
                    style={{
                      ...styles.bantProgressFill,
                      width: `${bantProgress}%`,
                    }}
                  />
                </div>
                <span style={styles.bantProgressText}>
                  {bantProgress}%
                </span>
              </div>
            )}

            {/* Conversation Messages Container */}
            <div style={styles.messagesOuterContainer}>
              <div style={styles.messagesInnerContainer}>
                {messages.map((message, index) => (
                  <div
                    key={`${message.id}-${index}`}
                    style={{
                      ...styles.messageWrapper,
                      ...(message.role === 'user' ? styles.messageWrapperUser : styles.messageWrapperAssistant),
                    }}
                  >
                    <div
                      style={{
                        ...styles.messageBubble,
                        ...(message.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant),
                      }}
                    >
                      {getMessageContent(message)}
                    </div>
                  </div>
                ))}
              </div>



              <div style={styles.inputContainer}>
                <div className="gradient" />
                <PromptInputProvider>
                  <PromptInput onSubmit={handlePromptSubmit}>
                    <PromptInputAttachments>
                      {(attachment) => (
                        <PromptInputAttachment key={attachment.id} data={attachment} />
                      )}
                    </PromptInputAttachments>
                    <PromptInputBody style={{ height: "80px" }}>
                      <PromptInputTextarea
                        placeholder="Ask me anything..."
                        ref={textareaRef}
                      />
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
                      </PromptInputTools>
                      <PromptInputSubmit status={isStreaming ? 'streaming' : undefined} />
                    </PromptInputFooter>
                  </PromptInput>
                </PromptInputProvider>
              </div>
            </div>
            {/* Suggestions - always at bottom, hide when clicked */}
            {showSuggestions && (
              <div style={styles.suggestionsAtBottom}>
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion.id}
                    variant="pill"
                    onClick={() =>
                      handlePromptSubmit({ text: suggestion.text, files: [] })
                    }
                  >
                    {suggestion.text}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
