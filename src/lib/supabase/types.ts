export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ab_test_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          session_id: string | null
          variant_id: string
          visitor_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          variant_id: string
          visitor_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          variant_id?: string
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_events_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "ab_test_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_test_variants: {
        Row: {
          created_at: string
          id: string
          is_control: boolean
          name: string
          path: string
          test_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_control?: boolean
          name: string
          path: string
          test_id: string
          weight?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_control?: boolean
          name?: string
          path?: string
          test_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_variants_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_tests: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          chatbot_id: string | null
          conversation_id: string | null
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          chatbot_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          chatbot_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbots: {
        Row: {
          business_context: string | null
          created_at: string | null
          display_name: string | null
          id: string
          initial_message: string | null
          instructions: string | null
          model: string | null
          name: string
          temperature: number | null
          updated_at: string | null
        }
        Insert: {
          business_context?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          initial_message?: string | null
          instructions?: string | null
          model?: string | null
          name: string
          temperature?: number | null
          updated_at?: string | null
        }
        Update: {
          business_context?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          initial_message?: string | null
          instructions?: string | null
          model?: string | null
          name?: string
          temperature?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          archived_at: string | null
          chatbot_id: string | null
          email_sent_at: string | null
          id: string
          is_archived: boolean | null
          last_message_at: string | null
          lead_captured: boolean | null
          message_count: number | null
          started_at: string | null
          visitor_email: string | null
          visitor_id: string | null
          visitor_metadata: Json | null
          visitor_name: string | null
        }
        Insert: {
          archived_at?: string | null
          chatbot_id?: string | null
          email_sent_at?: string | null
          id?: string
          is_archived?: boolean | null
          last_message_at?: string | null
          lead_captured?: boolean | null
          message_count?: number | null
          started_at?: string | null
          visitor_email?: string | null
          visitor_id?: string | null
          visitor_metadata?: Json | null
          visitor_name?: string | null
        }
        Update: {
          archived_at?: string | null
          chatbot_id?: string | null
          email_sent_at?: string | null
          id?: string
          is_archived?: boolean | null
          last_message_at?: string | null
          lead_captured?: boolean | null
          message_count?: number | null
          started_at?: string | null
          visitor_email?: string | null
          visitor_id?: string | null
          visitor_metadata?: Json | null
          visitor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      help_page_settings: {
        Row: {
          ai_instructions: string | null
          calendly_url: string | null
          chatbot_id: string | null
          created_at: string | null
          dark_primary_color: string | null
          default_theme: string | null
          enable_theme_switch: boolean | null
          favicon: string | null
          id: string
          intro_text: string | null
          light_primary_color: string | null
          logo: string | null
          page_description: string | null
          page_title: string | null
          rag_config: Json | null
          time_estimate: string | null
          updated_at: string | null
        }
        Insert: {
          ai_instructions?: string | null
          calendly_url?: string | null
          chatbot_id?: string | null
          created_at?: string | null
          dark_primary_color?: string | null
          default_theme?: string | null
          enable_theme_switch?: boolean | null
          favicon?: string | null
          id?: string
          intro_text?: string | null
          light_primary_color?: string | null
          logo?: string | null
          page_description?: string | null
          page_title?: string | null
          rag_config?: Json | null
          time_estimate?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_instructions?: string | null
          calendly_url?: string | null
          chatbot_id?: string | null
          created_at?: string | null
          dark_primary_color?: string | null
          default_theme?: string | null
          enable_theme_switch?: boolean | null
          favicon?: string | null
          id?: string
          intro_text?: string | null
          light_primary_color?: string | null
          logo?: string | null
          page_description?: string | null
          page_title?: string | null
          rag_config?: Json | null
          time_estimate?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_page_settings_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: true
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          archived_at: string | null
          conversation_id: string | null
          created_at: string | null
          id: string
          is_archived: boolean | null
          summary: Json
          visitor_email: string | null
          visitor_name: string | null
        }
        Insert: {
          archived_at?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          summary: Json
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Update: {
          archived_at?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          summary?: Json
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          role: string
          sources_used: Json | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role: string
          sources_used?: Json | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role?: string
          sources_used?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          chatbot_id: string | null
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          title: string | null
        }
        Insert: {
          chatbot_id?: string | null
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          title?: string | null
        }
        Update: {
          chatbot_id?: string | null
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sources_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_configs: {
        Row: {
          chatbot_id: string | null
          config: Json
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          chatbot_id?: string | null
          config: Json
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          chatbot_id?: string | null
          config?: Json
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "widget_configs_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_sources: {
        Args: {
          chatbot_id: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          similarity: number
          title: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

