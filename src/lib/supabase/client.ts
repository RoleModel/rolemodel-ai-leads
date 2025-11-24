import { createClient } from '@supabase/supabase-js'

import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type { Database } from './database.types'
export type DatabaseOld = {
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
        Insert: Omit<
          Database['public']['Tables']['chatbots']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['chatbots']['Insert']>
      }
      sources: {
        Row: {
          id: string
          chatbot_id: string
          title: string | null
          content: string
          embedding: number[] | null
          metadata: Record<string, any>
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['sources']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['sources']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          chatbot_id: string
          visitor_id: string | null
          visitor_email: string | null
          visitor_name: string | null
          visitor_metadata: Record<string, any>
          started_at: string
          last_message_at: string
          message_count: number
          lead_captured: boolean
        }
        Insert: Omit<
          Database['public']['Tables']['conversations']['Row'],
          'id' | 'started_at' | 'last_message_at' | 'message_count' | 'lead_captured'
        >
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          sources_used: any[]
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      analytics_events: {
        Row: {
          id: string
          chatbot_id: string
          conversation_id: string | null
          event_type: string
          metadata: Record<string, any>
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['analytics_events']['Row'],
          'id' | 'created_at'
        >
        Update: Partial<Database['public']['Tables']['analytics_events']['Insert']>
      }
    }
  }
}
