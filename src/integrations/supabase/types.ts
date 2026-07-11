export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string
          organization_id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      events: {
        Row: {
          id: number
          title: string
          date: string
          time: string
          location: string
          city: string
          country: string
          attendees: number
          maxCapacity: number
          image: string
          category: string
          price: string
          description: string
          organizer: string
          organizer_id: string
          isCompleted: boolean
          registrationOpen: boolean
          organization_id: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: number
          title: string
          date: string
          time: string
          location: string
          city: string
          country: string
          attendees?: number
          maxCapacity: number
          image: string
          category: string
          price: string
          description: string
          organizer: string
          organizer_id: string
          isCompleted?: boolean
          registrationOpen?: boolean
          organization_id?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          title?: string
          date?: string
          time?: string
          location?: string
          city?: string
          country?: string
          attendees?: number
          maxCapacity?: number
          image?: string
          category?: string
          price?: string
          description?: string
          organizer?: string
          organizer_id?: string
          isCompleted?: boolean
          registrationOpen?: boolean
          organization_id?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
      }
      organization_invites: {
        Row: {
          id: string
          organization_id: string
          email: string
          role: string
          token: string
          invited_by: string | null
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          role: string
          token: string
          invited_by?: string | null
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          role?: string
          token?: string
          invited_by?: string | null
          expires_at?: string
          created_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role: string
          joined_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      organization_settings: {
        Row: {
          organization_id: string
          logo_url: string | null
          favicon_url: string | null
          primary_color: string | null
          secondary_color: string | null
          accent_color: string | null
          website: string | null
          timezone: string | null
          font_family: string | null
          border_radius: string | null
          theme_preference: string | null
          feature_flags: Json | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          organization_id: string
          logo_url?: string | null
          favicon_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          accent_color?: string | null
          website?: string | null
          timezone?: string | null
          font_family?: string | null
          border_radius?: string | null
          theme_preference?: string | null
          feature_flags?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          organization_id?: string
          logo_url?: string | null
          favicon_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          accent_color?: string | null
          website?: string | null
          timezone?: string | null
          font_family?: string | null
          border_radius?: string | null
          theme_preference?: string | null
          feature_flags?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          organization_id: string | null
          registration_id: string | null
          amount: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          registration_id?: string | null
          amount: number
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          registration_id?: string | null
          amount?: number
          status?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      registrations: {
        Row: {
          id: string
          event_id: string | null
          user_id: string | null
          organization_id: string | null
          registration_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id?: string | null
          user_id?: string | null
          organization_id?: string | null
          registration_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string | null
          user_id?: string | null
          organization_id?: string | null
          registration_data?: Json | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          organization_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan_id: string
          status: string
          current_period_end: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan_id: string
          status: string
          current_period_end?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan_id?: string
          status?: string
          current_period_end?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      tenant_analytics_summary: {
        Row: {
          organization_id: string
          total_events: number
          upcoming_events: number
          completed_events: number
          total_registrations: number
          total_revenue: number
        }
      }
      revenue_trend_analytics: {
        Row: {
          organization_id: string
          date: string
          revenue: number
          payments_count: number
        }
      }
      registration_trend_analytics: {
        Row: {
          organization_id: string
          date: string
          registration_count: number
        }
      }
      event_analytics: {
        Row: {
          event_id: number
          organization_id: string
          title: string
          category: string
          date: string
          maxCapacity: number
          isCompleted: boolean
          total_registrations: number
          total_revenue: number
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
