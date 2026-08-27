export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          linked_user_id: string | null
          name: string
          public_id: string | null
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
          linked_user_id?: string | null
          name: string
          public_id?: string | null
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
          linked_user_id?: string | null
          name?: string
          public_id?: string | null
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
          daily_division_enabled: boolean
          description: string | null
          direction: string
          edit_token_hash: string
          expires_at: string
          id: string
          is_archived: boolean
          islamic_year: number | null
          language: string
          name: string
          occasion_type: string
          owner_user_id: string | null
          public_id: string
          range_end_ayah: number | null
          range_end_surah: number | null
          range_start_ayah: number | null
          range_start_surah: number | null
          range_type: string
          recurrence: Json | null
          rotation_style: string
          scheduler_version: string
          start_date: string | null
          start_juz: number
          status: string
          title: string | null
          updated_at: string
          uses_dates: boolean
        }
        Insert: {
          created_at?: string
          daily_division_enabled?: boolean
          description?: string | null
          direction?: string
          edit_token_hash: string
          expires_at?: string
          id?: string
          is_archived?: boolean
          islamic_year?: number | null
          language?: string
          name: string
          occasion_type?: string
          owner_user_id?: string | null
          public_id: string
          range_end_ayah?: number | null
          range_end_surah?: number | null
          range_start_ayah?: number | null
          range_start_surah?: number | null
          range_type?: string
          recurrence?: Json | null
          rotation_style?: string
          scheduler_version?: string
          start_date?: string | null
          start_juz?: number
          status?: string
          title?: string | null
          updated_at?: string
          uses_dates?: boolean
        }
        Update: {
          created_at?: string
          daily_division_enabled?: boolean
          description?: string | null
          direction?: string
          edit_token_hash?: string
          expires_at?: string
          id?: string
          is_archived?: boolean
          islamic_year?: number | null
          language?: string
          name?: string
          occasion_type?: string
          owner_user_id?: string | null
          public_id?: string
          range_end_ayah?: number | null
          range_end_surah?: number | null
          range_start_ayah?: number | null
          range_start_surah?: number | null
          range_type?: string
          recurrence?: Json | null
          rotation_style?: string
          scheduler_version?: string
          start_date?: string | null
          start_juz?: number
          status?: string
          title?: string | null
          updated_at?: string
          uses_dates?: boolean
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          id: string
          user_id: string | null
          group_id: string
          member_id: string
          week_number: number
          day_number: number
          is_completed: boolean
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          group_id: string
          member_id: string
          week_number: number
          day_number: number
          is_completed?: boolean
          completed_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          group_id?: string
          member_id?: string
          week_number?: number
          day_number?: number
          is_completed?: boolean
          completed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "group_members"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          surah_number: number
          ayah_number: number
          juz_number: number
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          surah_number: number
          ayah_number: number
          juz_number: number
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          surah_number?: number
          ayah_number?: number
          juz_number?: number
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          id: string
          group_id: string
          title: string
          content: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          title: string
          content: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          title?: string
          content?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_history: {
        Row: {
          id: string
          group_id: string
          action_type: string
          description: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          action_type: string
          description: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          action_type?: string
          description?: string
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_history_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          user_id: string
          daily_reminder_enabled: boolean
          reminder_time: string
          incomplete_reminder_enabled: boolean
          weekly_summary_enabled: boolean
          group_announcements_enabled: boolean
          timezone: string
          updated_at: string
        }
        Insert: {
          user_id: string
          daily_reminder_enabled?: boolean
          reminder_time?: string
          incomplete_reminder_enabled?: boolean
          weekly_summary_enabled?: boolean
          group_announcements_enabled?: boolean
          timezone?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          daily_reminder_enabled?: boolean
          reminder_time?: string
          incomplete_reminder_enabled?: boolean
          weekly_summary_enabled?: boolean
          group_announcements_enabled?: boolean
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endpoint?: string
          p256dh?: string
          auth?: string
          created_at?: string
        }
        Relationships: []
      }
      schedule_assignments: {
        Row: {
          created_at: string
          daily_breakdown: Json | null
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
          daily_breakdown?: Json | null
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
          daily_breakdown?: Json | null
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
          daily_division_enabled: boolean
          description: string | null
          group_id: string
          id: string
          is_active: boolean
          islamic_year: number | null
          occasion_type: string
          scheduler_version: string
          start_date: string | null
          title: string | null
          total_juz_per_week: number
          uses_dates: boolean
          version_number: number
          weeks_count: number
        }
        Insert: {
          created_at?: string
          daily_division_enabled?: boolean
          description?: string | null
          group_id: string
          id?: string
          is_active?: boolean
          islamic_year?: number | null
          occasion_type?: string
          scheduler_version?: string
          start_date?: string | null
          title?: string | null
          total_juz_per_week?: number
          uses_dates?: boolean
          version_number?: number
          weeks_count: number
        }
        Update: {
          created_at?: string
          daily_division_enabled?: boolean
          description?: string | null
          group_id?: string
          id?: string
          is_active?: boolean
          islamic_year?: number | null
          occasion_type?: string
          scheduler_version?: string
          start_date?: string | null
          title?: string | null
          total_juz_per_week?: number
          uses_dates?: boolean
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
