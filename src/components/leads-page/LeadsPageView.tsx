'use client'

import { useChat } from '@ai-sdk/react'
import {
  Delete02Icon,
  Moon02Icon,
  PlusSignIcon,
  Refresh01Icon,
  Settings02Icon,
  SidebarLeftIcon,
  Copy01Icon,
  Sun01Icon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Message02Icon
} from '@hugeicons-pro/core-stroke-standard'

import { HugeiconsIcon } from '@hugeicons/react'
import { DefaultChatTransport, type UIMessage, isTextUIPart } from 'ai'
import Image from 'next/image'
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Message, MessageAction, MessageActions, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation';

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
import dynamic from 'next/dynamic'

const AnimatedConversationDemo = dynamic(
  () => import('@/components/leads-page/AnimatedConversationDemo').then(mod => ({ default: mod.AnimatedConversationDemo })),
  {
    ssr: false,
    loading: () => (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div style={{ fontSize: 'var(--op-font-small)', color: 'var(--op-color-neutral-on-plus-max)' }}>
          Loading...
        </div>
      </div>
    )
  }
)
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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

const getStyles = (isEmbed: boolean) => ({
  container: {
    display: 'flex',
    backgroundColor: 'var(--op-color-neutral-plus-seven)',
    height: isEmbed ? '100%' : '100%',
    width: '100%',
    // overflowY: 'auto' as const,
  },
  sidebar: {
    '--_op-sidebar-background-color': 'var(--op-color-neutral-plus-seven)',
    '--_op-sidebar-rail-width': 'calc(var(--op-space-scale-unit) * 6)',
    '--_op-sidebar-drawer-width': 'calc(var(--op-space-scale-unit) * 30)',
    '--_op-sidebar-border-color': 'var(--op-color-border)',

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
  hero: {
    width: '100%',
    maxWidth: 700 as const,
    margin: '0 auto',
    flex: 1,
    minHeight: 0 as const,
    overflowY: 'auto' as const,
    padding: 'var(--op-space-medium) var(--op-space-small)',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    gap: 'var(--op-space-large)',
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
    fontSize: 'var(--op-font-5x-large)',
    fontWeight: 700,
    marginBottom: 'var(--op-space-x-small)',
  },
  pageDescription: {
    fontSize: 'var(--op-font-medium)',
    color: 'var(--op-color-on-background-alt)',
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
    flex: 1,
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
  },
  chatHeaderCenter: {
    textAlign: 'center' as const,
  },
  bantProgressContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center' as const,
    gap: 'var(--op-space-small)',
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
    fontWeight: 500,
    fontFamily: 'var(--font-geist-mono)',
    color: 'var(--op-color-neutral-on-plus-max)',
    minWidth: '38px',
    textAlign: 'right' as const,
  },
  messagesOuterContainer: {
    width: '100%',
    maxWidth: 700,
    display: 'flex',
    flexDirection: 'column' as const,
    flexGrow: 1,
    minHeight: 0,
  },
  messagesInnerContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--op-space-small)',
    flexGrow: 1,
    minHeight: 0,
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
    width: '100%',
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
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 'var(--op-radius-circle)',
    backgroundColor: 'var(--op-color-primary)',
    color: 'white',
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
    flexShrink: 0,
    fontSize: 'var(--op-font-small)',
    fontWeight: 600,
  },
  messageAvatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    borderRadius: 'var(--op-radius-circle)',
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
})

const DEFAULT_SUGGESTIONS: Suggestion[] = [
  { id: '1', text: 'Are we outgrowing our current tools?' },
  { id: '2', text: 'How do we reduce manual work?' },
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
  const [isMobile, setIsMobile] = useState(false)
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [disliked, setDisliked] = useState<Record<string, boolean>>({});


  // Detect mobile viewport and auto-collapse sidebar
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)')

    const checkMobile = (e: MediaQueryListEvent | MediaQueryList) => {
      const mobile = e.matches
      setIsMobile(mobile)
      setSidebarCollapsed(mobile)
    }

    checkMobile(mediaQuery)
    mediaQuery.addEventListener('change', checkMobile)

    return () => mediaQuery.removeEventListener('change', checkMobile)
  }, [])
  const [suggestions, setSuggestions] = useState<Suggestion[]>(DEFAULT_SUGGESTIONS)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Get styles with isEmbed prop
  const styles = getStyles(isEmbed)

  // Check if we're on the client to avoid SSR issues
  const isClient = typeof window !== 'undefined'

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
      new DefaultChatTransport({
        api: '/api/chat',
        body: {
          chatbotId,
        },
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

  const { regenerate } = useChat();


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

  const handleUpdateSuggestion = (id: string, newText: string) => {
    setSuggestions(suggestions.map((s) =>
      s.id === id ? { ...s, text: newText } : s
    ))
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
    setShowDemo(false)
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
    <div className="app-with-sidebar" style={styles.container}>
      {/* Sidebar */}
      {showSidebar && (
        <div
          className={`sidebar${sidebarCollapsed ? ' sidebar--rail' : ''}${isMobile ? ' sidebar--compact' : ''}`}
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



          {/* New Chat / Start Chatting Button */}
          {showDemo ? (
            <Button
              variant={sidebarCollapsed ? 'primaryicon' : 'primary'}
              size="lg"
              style={{ width: '100%' }}
              onClick={() => setShowDemo(false)}
            >
              <HugeiconsIcon icon={Message02Icon} size={20} />
              {!sidebarCollapsed && 'Start chatting'}
            </Button>
          ) : (
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
          )}

          {/* Chat History List */}
          {!sidebarCollapsed && chatHistory.length > 0 && (
            <div style={styles.chatHistoryContainer}>
              {chatHistory.map((chat) => (
                <Button
                  key={chat.id}
                  variant="secondary"
                  style={{
                    justifyContent: 'flex-start',
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
          <AnimatedConversationDemo onInterrupt={() => setShowDemo(false)} editMode={editMode} />
        ) : (
          <div style={styles.hero}>


            {/* Conversation Messages Container */}

            <Conversation style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--op-space-small)',
              // flex: '1',
              minHeight: 0,
              maxHeight: 600,
              overflowY: 'auto',
              width: '98%',
            }}>
              <ConversationContent>
                {messages.map((message, messageIndex) => (
                  <Fragment key={message.id}>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'text':
                          const isLastMessage =
                            messageIndex === messages.length - 1;
                          return (
                            <Fragment key={`${message.id}-${i}`}>
                              <Message from={message.role}>
                                {message.role === 'assistant' && (
                                  <div style={styles.messageAvatar}>
                                    {settings.favicon ? (
                                      <Image
                                        src={settings.favicon}
                                        alt="AI"
                                        width={32}
                                        height={32}
                                        style={styles.messageAvatarImage}
                                      />
                                    ) : (
                                      'AI'
                                    )}
                                  </div>
                                )}
                                <MessageContent>
                                  {isClient ? (
                                    <MessageResponse>{part.text}</MessageResponse>
                                  ) : (
                                    <div>{part.text}</div>
                                  )}

                                  {message.role === 'assistant' && isLastMessage && (
                                    <MessageActions>
                                      <MessageAction
                                        label="Like"
                                        onClick={() =>
                                          setLiked((prev) => ({
                                            ...prev,
                                            [message.id]: !prev[message.id],
                                          }))
                                        }
                                        tooltip="Like this response"
                                      >
                                        <HugeiconsIcon
                                          icon={ThumbsUpIcon}
                                          size={16}
                                          color={liked[message.id] ? "currentColor" : "none"}
                                        />
                                      </MessageAction>
                                      <MessageAction
                                        label="Dislike"
                                        onClick={() =>
                                          setDisliked((prev) => ({
                                            ...prev,
                                            [message.id]: !prev[message.id],
                                          }))
                                        }
                                        tooltip="Dislike this response"
                                      >
                                        <HugeiconsIcon
                                          icon={ThumbsDownIcon}
                                          size={16}
                                          color={disliked[message.id] ? "currentColor" : "none"}
                                        />
                                      </MessageAction>
                                      <MessageAction
                                        onClick={() => regenerate()}
                                        label="Retry"
                                      >
                                        <HugeiconsIcon icon={Refresh01Icon} size={16} />
                                      </MessageAction>
                                      <MessageAction
                                        onClick={() =>
                                          navigator.clipboard.writeText(part.text)
                                        }
                                        label="Copy"
                                      >
                                        <HugeiconsIcon icon={Copy01Icon} size={16} />
                                      </MessageAction>
                                    </MessageActions>

                                  )}
                                </MessageContent>
                              </Message>
                            </Fragment>
                          );
                        default:
                          return null;
                      }
                    })}
                  </Fragment>
                ))}
              </ConversationContent>
            </Conversation>
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
                      placeholder="Tell me about your project..."
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
            {/* Suggestions - always at bottom, hide when clicked */}
            {showSuggestions && (
              <div style={styles.suggestionsAtBottom}>
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} style={{ position: 'relative' }}>
                    <Button
                      variant="pill"
                      onClick={() => {
                        if (editMode) {
                          setActiveSuggestionId(suggestion.id === activeSuggestionId ? null : suggestion.id)
                        } else {
                          handlePromptSubmit({ text: suggestion.text, files: [] })
                        }
                      }}
                    >
                      {suggestion.text}
                    </Button>
                    {editMode && activeSuggestionId === suggestion.id && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        display: 'flex',
                        gap: '4px',
                        background: 'var(--op-color-background)',
                        borderRadius: 'var(--op-radius-medium)',
                        padding: '2px',
                        boxShadow: 'var(--op-shadow-low)',
                      }}>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="icon" size="sm">
                              <HugeiconsIcon icon={Settings02Icon} size={12} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="grid gap-4">
                              <div className="space-y-2">
                                <h4 className="font-medium leading-none">Edit Suggestion</h4>
                                <p className="text-sm text-muted-foreground">
                                  Update the suggestion text
                                </p>
                              </div>
                              <div className="grid gap-2">
                                <div className="grid gap-2">
                                  <Label htmlFor={`suggestion-text-${suggestion.id}`}>Text</Label>
                                  <Input
                                    id={`suggestion-text-${suggestion.id}`}
                                    defaultValue={suggestion.text}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleUpdateSuggestion(suggestion.id, e.currentTarget.value)
                                        setActiveSuggestionId(null)
                                      }
                                    }}
                                    onBlur={(e) => {
                                      handleUpdateSuggestion(suggestion.id, e.target.value)
                                      setActiveSuggestionId(null)
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Button
                          variant="icon"
                          size="sm"
                          onClick={() => {
                            handleDeleteSuggestion(suggestion.id)
                            setActiveSuggestionId(null)
                          }}
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={12} />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {editMode && (
                  <Button
                    variant="pill"
                    onClick={handleAddSuggestion}
                    style={{ borderStyle: 'dashed' }}
                  >
                    <HugeiconsIcon icon={PlusSignIcon} size={16} />
                    Add Suggestion
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Privacy/Terms Links */}
      <div
        style={{
          position: 'fixed',
          bottom: 'var(--op-space-medium)',
          right: 'var(--op-space-medium)',
          display: 'flex',
          gap: 'var(--op-space-small)',
          zIndex: 50,
        }}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
            >
              Privacy
            </Button>
          </DialogTrigger>
          <DialogContent style={{ '--_op-confirm-dialog-width': '600px' } as React.CSSProperties}>
            <DialogHeader>
              <DialogTitle>Privacy Policy</DialogTitle>
              <DialogDescription>
                How we handle your information
              </DialogDescription>
            </DialogHeader>
            <div className="confirm-dialog__body" style={{ fontSize: 'var(--op-font-small)', lineHeight: 1.6 }}>
              <p style={{ marginBottom: 'var(--op-space-medium)' }}>
                <strong>Information We Collect</strong><br />
                When you use our chat service, we collect:
              </p>
              <ul style={{ marginBottom: 'var(--op-space-medium)', paddingLeft: 'var(--op-space-large)' }}>
                <li>Messages you send during conversations</li>
                <li>Contact information you voluntarily provide (name, email)</li>
                <li>Technical data (IP address, approximate location, browser type)</li>
              </ul>
              <p style={{ marginBottom: 'var(--op-space-medium)' }}>
                <strong>How We Use Your Information</strong><br />
                We use this information to:
              </p>
              <ul style={{ marginBottom: 'var(--op-space-medium)', paddingLeft: 'var(--op-space-large)' }}>
                <li>Provide and improve our chat service</li>
                <li>Respond to your inquiries</li>
                <li>Analyze usage patterns to enhance user experience</li>
              </ul>
              <p>
                <strong>Data Retention</strong><br />
                We retain conversation data to provide you with better service and may delete it upon request.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
            >
              Terms
            </Button>
          </DialogTrigger>
          <DialogContent style={{ '--_op-confirm-dialog-width': '600px' } as React.CSSProperties}>
            <DialogHeader>
              <DialogTitle>Terms of Service</DialogTitle>
              <DialogDescription>
                Guidelines for using our service
              </DialogDescription>
            </DialogHeader>

            <div className="confirm-dialog__body" style={{ fontSize: 'var(--op-font-small)', lineHeight: 1.6 }}>
              <p style={{ marginBottom: 'var(--op-space-medium)' }}>
                <strong>Acceptable Use</strong><br />
                By using this chat service, you agree to:
              </p>
              <ul style={{ marginBottom: 'var(--op-space-medium)', paddingLeft: 'var(--op-space-large)' }}>
                <li>Provide accurate information when requested</li>
                <li>Use the service for legitimate business inquiries</li>
                <li>Not attempt to misuse or abuse the service</li>
              </ul>
              <p style={{ marginBottom: 'var(--op-space-medium)' }}>
                <strong>AI-Powered Responses</strong><br />
                This chat service uses artificial intelligence. While we strive for accuracy, responses may not always be complete or error-free. For critical decisions, please verify information with our team.
              </p>
              <p>
                <strong>Limitation of Liability</strong><br />
                We provide this service &quot;as is&quot; without warranties. We are not liable for any damages arising from use of this service.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
