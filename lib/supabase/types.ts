export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      group_members: {
        Row: {
          created_at: string
          end_juz: number
          end_surah: number | null
          group_id: string
          id: string
          knowledge_type: string
          name: string
          sort_order: number
          start_juz: number
          start_surah: number | null
          weekly_amount: number
        }
        Insert: {
          created_at?: string
          end_juz?: number
          end_surah?: number | null
          group_id: string
          id?: string
          knowledge_type?: string
          name: string
          sort_order?: number
          start_juz?: number
          start_surah?: number | null
          weekly_amount: number
        }
        Update: {
          created_at?: string
          end_juz?: number
          end_surah?: number | null
          group_id?: string
          id?: string
          knowledge_type?: string
          name?: string
          sort_order?: number
          start_juz?: number
          start_surah?: number | null
          weekly_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          direction: string
          edit_token_hash: string
          expires_at: string
          id: string
          language: string
          name: string
          owner_user_id: string | null
          public_id: string
          range_end_ayah: number | null
          range_end_surah: number | null
          range_start_ayah: number | null
          range_start_surah: number | null
          range_type: string
          rotation_style: string
          scheduler_version: string
          start_juz: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          direction?: string
          edit_token_hash: string
          expires_at?: string
          id?: string
          language?: string
          name: string
          owner_user_id?: string | null
          public_id: string
          range_end_ayah?: number | null
          range_end_surah?: number | null
          range_start_ayah?: number | null
          range_start_surah?: number | null
          range_type?: string
          rotation_style?: string
          scheduler_version?: string
          start_juz?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          direction?: string
          edit_token_hash?: string
          expires_at?: string
          id?: string
          language?: string
          name?: string
          owner_user_id?: string | null
          public_id?: string
          range_end_ayah?: number | null
          range_end_surah?: number | null
          range_start_ayah?: number | null
          range_start_surah?: number | null
          range_type?: string
          rotation_style?: string
          scheduler_version?: string
          start_juz?: number
          updated_at?: string
        }
        Relationships: []
      }
      schedule_assignments: {
        Row: {
          created_at: string
          end_ayah: number
          end_global_ayah: number | null
          end_juz: number
          end_surah: number
          end_surah_name_ar: string
          end_surah_name_en: string
          id: string
          member_id: string
          member_name: string
          schedule_week_id: string
          sort_order: number
          start_ayah: number
          start_global_ayah: number | null
          start_juz: number
          start_surah: number
          start_surah_name_ar: string
          start_surah_name_en: string
          weekly_amount: number
        }
        Insert: {
          created_at?: string
          end_ayah: number
          end_global_ayah?: number | null
          end_juz: number
          end_surah: number
          end_surah_name_ar: string
          end_surah_name_en: string
          id?: string
          member_id: string
          member_name: string
          schedule_week_id: string
          sort_order?: number
          start_ayah: number
          start_global_ayah?: number | null
          start_juz: number
          start_surah: number
          start_surah_name_ar: string
          start_surah_name_en: string
          weekly_amount: number
        }
        Update: {
          created_at?: string
          end_ayah?: number
          end_global_ayah?: number | null
          end_juz?: number
          end_surah?: number
          end_surah_name_ar?: string
          end_surah_name_en?: string
          id?: string
          member_id?: string
          member_name?: string
          schedule_week_id?: string
          sort_order?: number
          start_ayah?: number
          start_global_ayah?: number | null
          start_juz?: number
          start_surah?: number
          start_surah_name_ar?: string
          start_surah_name_en?: string
          weekly_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "schedule_assignments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "group_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_assignments_schedule_week_id_fkey"
            columns: ["schedule_week_id"]
            isOneToOne: false
            referencedRelation: "schedule_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_plans: {
        Row: {
          created_at: string
          group_id: string
          id: string
          is_active: boolean
          range_end_ayah: number | null
          range_end_surah: number | null
          range_start_ayah: number | null
          range_start_surah: number | null
          range_type: string
          rotation_style: string
          scheduler_version: string
          start_juz: number
          total_juz_per_week: number
          version_number: number
          weeks_count: number
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          is_active?: boolean
          range_end_ayah?: number | null
          range_end_surah?: number | null
          range_start_ayah?: number | null
          range_start_surah?: number | null
          range_type?: string
          rotation_style?: string
          scheduler_version?: string
          start_juz?: number
          total_juz_per_week?: number
          version_number?: number
          weeks_count: number
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          is_active?: boolean
          range_end_ayah?: number | null
          range_end_surah?: number | null
          range_start_ayah?: number | null
          range_start_surah?: number | null
          range_type?: string
          rotation_style?: string
          scheduler_version?: string
          start_juz?: number
          total_juz_per_week?: number
          version_number?: number
          weeks_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "schedule_plans_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_weeks: {
        Row: {
          created_at: string
          id: string
          schedule_plan_id: string
          total_juz: number
          week_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          schedule_plan_id: string
          total_juz?: number
          week_number: number
        }
        Update: {
          created_at?: string
          id?: string
          schedule_plan_id?: string
          total_juz?: number
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "schedule_weeks_schedule_plan_id_fkey"
            columns: ["schedule_plan_id"]
            isOneToOne: false
            referencedRelation: "schedule_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
