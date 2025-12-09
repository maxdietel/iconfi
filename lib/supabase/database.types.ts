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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      examination: {
        Row: {
          answers_file: string
          created_at: string
          id: string
          questions_file: string
          topic_id: string
          year: number
        }
        Insert: {
          answers_file: string
          created_at?: string
          id?: string
          questions_file: string
          topic_id: string
          year: number
        }
        Update: {
          answers_file?: string
          created_at?: string
          id?: string
          questions_file?: string
          topic_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "examination_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic"
            referencedColumns: ["id"]
          },
        ]
      }
      joint_question_slide: {
        Row: {
          created_at: string
          id: string
          page_id: string
          question_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_id: string
          question_id: string
        }
        Update: {
          created_at?: string
          id?: string
          page_id?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "joint_question_slide_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "joint_question_slide_slide_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "learning_material_page"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_material: {
        Row: {
          course_name: string
          created_at: string
          focus_area: string
          id: string
          lecturer: string
          total_pages: number
          url: string
        }
        Insert: {
          course_name: string
          created_at?: string
          focus_area: string
          id?: string
          lecturer: string
          total_pages: number
          url: string
        }
        Update: {
          course_name?: string
          created_at?: string
          focus_area?: string
          id?: string
          lecturer?: string
          total_pages?: number
          url?: string
        }
        Relationships: []
      }
      learning_material_external_resource: {
        Row: {
          created_at: string
          description: string
          id: string
          learning_material_page_id: string
          type: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          learning_material_page_id: string
          type: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          learning_material_page_id?: string
          type?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_material_external_resou_learning_material_page_id_fkey"
            columns: ["learning_material_page_id"]
            isOneToOne: false
            referencedRelation: "learning_material_page"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_material_page: {
        Row: {
          content: string | null
          created_at: string
          description: string
          embedding: string | null
          has_diagram: boolean
          id: string
          key_concepts: string
          learning_material_topic_id: string
          number: number
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          description: string
          embedding?: string | null
          has_diagram: boolean
          id?: string
          key_concepts: string
          learning_material_topic_id: string
          number: number
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string
          embedding?: string | null
          has_diagram?: boolean
          id?: string
          key_concepts?: string
          learning_material_topic_id?: string
          number?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_material_topic_slide_learning_material_topic_id_fkey"
            columns: ["learning_material_topic_id"]
            isOneToOne: false
            referencedRelation: "learning_material_topic"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_material_topic: {
        Row: {
          created_at: string
          id: string
          learning_material_id: string
          page_numbers: string
          summary: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          learning_material_id: string
          page_numbers: string
          summary: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          learning_material_id?: string
          page_numbers?: string
          summary?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_material_topic_learning_material_id_fkey"
            columns: ["learning_material_id"]
            isOneToOne: false
            referencedRelation: "learning_material"
            referencedColumns: ["id"]
          },
        ]
      }
      option: {
        Row: {
          correct_match_id: string | null
          correct_order_index: number | null
          created_at: string
          id: string
          is_correct: boolean | null
          question_id: string
          side: string | null
          text: string
        }
        Insert: {
          correct_match_id?: string | null
          correct_order_index?: number | null
          created_at?: string
          id?: string
          is_correct?: boolean | null
          question_id: string
          side?: string | null
          text: string
        }
        Update: {
          correct_match_id?: string | null
          correct_order_index?: number | null
          created_at?: string
          id?: string
          is_correct?: boolean | null
          question_id?: string
          side?: string | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "option_correct_match_id_fkey"
            columns: ["correct_match_id"]
            isOneToOne: false
            referencedRelation: "option"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "option_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question"
            referencedColumns: ["id"]
          },
        ]
      }
      question: {
        Row: {
          code: string
          content: string | null
          context: string | null
          created_at: string
          embedding: string | null
          examination_id: string
          id: string
          options_prefix: string | null
          options_title: string | null
          pages_matched_at: string | null
          question_text: string
          question_type: string
          topic: string
          updated_at: string | null
        }
        Insert: {
          code: string
          content?: string | null
          context?: string | null
          created_at?: string
          embedding?: string | null
          examination_id: string
          id?: string
          options_prefix?: string | null
          options_title?: string | null
          pages_matched_at?: string | null
          question_text: string
          question_type: string
          topic: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          content?: string | null
          context?: string | null
          created_at?: string
          embedding?: string | null
          examination_id?: string
          id?: string
          options_prefix?: string | null
          options_title?: string | null
          pages_matched_at?: string | null
          question_text?: string
          question_type?: string
          topic?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "question_examination_id_fkey"
            columns: ["examination_id"]
            isOneToOne: false
            referencedRelation: "examination"
            referencedColumns: ["id"]
          },
        ]
      }
      sr_card: {
        Row: {
          created_at: string
          difficulty: number
          due: string
          elapsed_days: number
          id: string
          lapses: number
          last_review: string | null
          learning_steps: number
          question_id: string
          reps: number
          scheduled_days: number
          stability: number
          state: number
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty: number
          due: string
          elapsed_days: number
          id?: string
          lapses: number
          last_review?: string | null
          learning_steps: number
          question_id: string
          reps: number
          scheduled_days: number
          stability: number
          state: number
          user_id?: string
        }
        Update: {
          created_at?: string
          difficulty?: number
          due?: string
          elapsed_days?: number
          id?: string
          lapses?: number
          last_review?: string | null
          learning_steps?: number
          question_id?: string
          reps?: number
          scheduled_days?: number
          stability?: number
          state?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sr_card_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question"
            referencedColumns: ["id"]
          },
        ]
      }
      sr_review_log: {
        Row: {
          card_id: string
          created_at: string
          difficulty: number
          due: string
          elapsed_days: number
          id: string
          last_elapsed_days: number
          learning_steps: number
          rating: number
          review: string
          scheduled_days: number
          stability: number
          state: number
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string
          difficulty: number
          due: string
          elapsed_days: number
          id?: string
          last_elapsed_days: number
          learning_steps: number
          rating: number
          review: string
          scheduled_days: number
          stability: number
          state: number
          user_id?: string
        }
        Update: {
          card_id?: string
          created_at?: string
          difficulty?: number
          due?: string
          elapsed_days?: number
          id?: string
          last_elapsed_days?: number
          learning_steps?: number
          rating?: number
          review?: string
          scheduled_days?: number
          stability?: number
          state?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sr_review_log_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "sr_card"
            referencedColumns: ["id"]
          },
        ]
      }
      topic: {
        Row: {
          created_at: string
          id: string
          topic: string
        }
        Insert: {
          created_at?: string
          id?: string
          topic: string
        }
        Update: {
          created_at?: string
          id?: string
          topic?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_pages_to_question: {
        Args: { question_id: string; result_limit?: number }
        Returns: {
          content_text: string
          page_id: string
          question_id: string
          similarity: number
          title: string
        }[]
      }
      match_slides_to_question: {
        Args: { question_key: unknown; result_limit?: number }
        Returns: {
          content_text: string
          similarity: number
          slide_id: number
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
  public: {
    Enums: {},
  },
} as const
