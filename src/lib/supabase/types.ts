export type Database = {
  public: {
    Tables: {
      chatbots: {
        Row: {
          id: string
          name: string
          instructions: string | null
          business_context: string | null
          model: string
          temperature: number
          display_name: string | null
          initial_message: string
          created_at: string
          updated_at: string
        }
        Insert: {
          chatbot_id?: string
          name: string
          instructions?: string | null
          business_context?: string | null
          model?: string
          temperature?: number
          display_name?: string | null
          initial_message?: string
        }
        Update: {
          name?: string
          instructions?: string | null
          business_context?: string | null
          model?: string
          temperature?: number
          display_name?: string | null
          initial_message?: string
        }
      }
      sources: {
        Row: {
          id: string
          chatbot_id: string
          title: string | null
          content: string
          embedding: number[] | null
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: {
          chatbot_id: string
          title?: string | null
          content: string
          embedding?: number[] | null
          metadata?: Record<string, unknown>
        }
        Update: {
          title?: string | null
          content?: string
          embedding?: number[] | null
          metadata?: Record<string, unknown>
        }
      }
      conversations: {
        Row: {
          id: string
          chatbot_id: string
          visitor_id: string | null
          visitor_email: string | null
          visitor_name: string | null
          visitor_metadata: Record<string, unknown>
          started_at: string
          last_message_at: string
          message_count: number
          lead_captured: boolean
        }
        Insert: {
          chatbot_id: string
          visitor_id?: string | null
          visitor_email?: string | null
          visitor_name?: string | null
          visitor_metadata?: Record<string, unknown>
        }
        Update: {
          visitor_email?: string | null
          visitor_name?: string | null
          visitor_metadata?: Record<string, unknown>
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          sources_used: unknown[]
          created_at: string
        }
        Insert: {
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          sources_used?: unknown[]
        }
        Update: {
          content?: string
          sources_used?: unknown[]
        }
      }
      analytics_events: {
        Row: {
          id: string
          chatbot_id: string
          conversation_id: string | null
          event_type: string
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: {
          chatbot_id: string
          conversation_id?: string | null
          event_type: string
          metadata?: Record<string, unknown>
        }
        Update: {
          metadata?: Record<string, unknown>
        }
      }
    }
  }
}
