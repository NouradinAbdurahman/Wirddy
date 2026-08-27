export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      groups: {
        Row: {
          id: string
          public_id: string
          edit_token_hash: string
          name: string
          language: "ar" | "en"
          direction: "rtl" | "ltr"
          scheduler_version: string
          expires_at: string
          created_at: string
          updated_at: string
          owner_user_id: string | null
        }
        Insert: {
          id?: string
          public_id: string
          edit_token_hash: string
          name: string
          language?: "ar" | "en"
          direction?: "rtl" | "ltr"
          scheduler_version?: string
          expires_at?: string
          created_at?: string
          updated_at?: string
          owner_user_id?: string | null
        }
        Update: {
          id?: string
          public_id?: string
          edit_token_hash?: string
          name?: string
          language?: "ar" | "en"
          direction?: "rtl" | "ltr"
          scheduler_version?: string
          expires_at?: string
          created_at?: string
          updated_at?: string
          owner_user_id?: string | null
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          name: string
          knowledge_type: "entire" | "juz_range" | "surah_range"
          start_juz: number
          end_juz: number
          start_surah: number | null
          end_surah: number | null
          weekly_amount: number
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          name: string
          knowledge_type?: "entire" | "juz_range" | "surah_range"
          start_juz?: number
          end_juz?: number
          start_surah?: number | null
          end_surah?: number | null
          weekly_amount: number
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          name?: string
          knowledge_type?: "entire" | "juz_range" | "surah_range"
          start_juz?: number
          end_juz?: number
          start_surah?: number | null
          end_surah?: number | null
          weekly_amount?: number
          sort_order?: number
          created_at?: string
        }
      }
      schedule_plans: {
        Row: {
          id: string
          group_id: string
          version_number: number
          weeks_count: number
          total_juz_per_week: number
          scheduler_version: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          version_number?: number
          weeks_count: number
          total_juz_per_week?: number
          scheduler_version?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          version_number?: number
          weeks_count?: number
          total_juz_per_week?: number
          scheduler_version?: string
          is_active?: boolean
          created_at?: string
        }
      }
      schedule_weeks: {
        Row: {
          id: string
          schedule_plan_id: string
          week_number: number
          total_juz: number
          created_at: string
        }
        Insert: {
          id?: string
          schedule_plan_id: string
          week_number: number
          total_juz?: number
          created_at?: string
        }
        Update: {
          id?: string
          schedule_plan_id?: string
          week_number?: number
          total_juz?: number
          created_at?: string
        }
      }
      schedule_assignments: {
        Row: {
          id: string
          schedule_week_id: string
          member_id: string
          member_name: string
          weekly_amount: number
          start_juz: number
          end_juz: number
          start_surah: number
          start_surah_name_ar: string
          start_surah_name_en: string
          start_ayah: number
          end_surah: number
          end_surah_name_ar: string
          end_surah_name_en: string
          end_ayah: number
          start_global_ayah: number | null
          end_global_ayah: number | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          schedule_week_id: string
          member_id: string
          member_name: string
          weekly_amount: number
          start_juz: number
          end_juz: number
          start_surah: number
          start_surah_name_ar: string
          start_surah_name_en: string
          start_ayah: number
          end_surah: number
          end_surah_name_ar: string
          end_surah_name_en: string
          end_ayah: number
          start_global_ayah?: number | null
          end_global_ayah?: number | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          schedule_week_id?: string
          member_id?: string
          member_name?: string
          weekly_amount?: number
          start_juz?: number
          end_juz?: number
          start_surah?: number
          start_surah_name_ar?: string
          start_surah_name_en?: string
          start_ayah?: number
          end_surah?: number
          end_surah_name_ar?: string
          end_surah_name_en?: string
          end_ayah?: number
          start_global_ayah?: number | null
          end_global_ayah?: number | null
          sort_order?: number
          created_at?: string
        }
      }
    }
  }
}
