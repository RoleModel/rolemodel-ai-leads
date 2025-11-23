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

export default function WidgetPage() {
  const params = useParams()
  const chatbotId = params.chatbotId as string
  const [chatbot, setChatbot] = useState<Chatbot | null>(null)

  useEffect(() => {
    async function loadChatbot() {
      try {
        const res = await fetch(`/api/chatbot?id=${chatbotId}`)
        const data = await res.json()
        setChatbot(data.chatbot)
      } catch (error) {
        console.error('Error loading chatbot:', error)
      }
    }

    loadChatbot()
  }, [chatbotId])

  if (!chatbot) {
    return null
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: 'var(--op-color-background)',
    }}>
      <ChatInterface
        chatbotId={chatbotId}
        initialMessage={chatbot.initial_message}
      />
    </div>
  )
}
