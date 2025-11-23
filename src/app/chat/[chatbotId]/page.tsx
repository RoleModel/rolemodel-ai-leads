"use client"

import { ChatInterface } from "@/components/chat/ChatInterface"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"

interface Chatbot {
  id: string
  name: string
  display_name?: string
  initial_message?: string
}

export default function StandaloneChatPage() {
  const params = useParams()
  const chatbotId = params.chatbotId as string
  const [chatbot, setChatbot] = useState<Chatbot | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadChatbot() {
      try {
        const res = await fetch(`/api/chatbot?id=${chatbotId}`)
        const data = await res.json()
        setChatbot(data.chatbot)
      } catch (error) {
        console.error('Error loading chatbot:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadChatbot()
  }, [chatbotId])

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: 'var(--op-font-medium)',
        color: 'var(--op-color-neutral-on-plus-max)',
      }}>
        Loading...
      </div>
    )
  }

  if (!chatbot) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: 'var(--op-font-medium)',
        color: 'var(--op-color-neutral-on-plus-max)',
      }}>
        Chatbot not found
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: 'var(--op-color-background)',
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--op-space-medium) var(--op-space-large)',
        borderBottom: '1px solid var(--op-color-border)',
        backgroundColor: 'var(--op-color-background)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--op-space-small)',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--op-radius-pill)',
          backgroundColor: 'var(--op-color-primary-base)',
          color: 'var(--op-color-primary-on-base)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--op-font-large)',
          fontWeight: 'var(--op-font-weight-bold)',
        }}>
          R
        </div>
        <h1 style={{
          fontSize: 'var(--op-font-large)',
          fontWeight: 'var(--op-font-weight-bold)',
          margin: 0,
        }}>
          {chatbot.display_name || chatbot.name}
        </h1>
      </div>

      {/* Chat Interface */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ChatInterface
          chatbotId={chatbotId}
          initialMessage={chatbot.initial_message}
        />
      </div>

      {/* Footer */}
      <div style={{
        padding: 'var(--op-space-small)',
        textAlign: 'center',
        fontSize: 'var(--op-font-x-small)',
        color: 'var(--op-color-neutral-on-plus-max)',
        borderTop: '1px solid var(--op-color-border)',
      }}>
        Powered by RoleModel Software
      </div>
    </div>
  )
}
