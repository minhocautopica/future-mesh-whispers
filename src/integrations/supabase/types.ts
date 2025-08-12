export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      answers: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          mime_type: string | null
          question_key: Database["public"]["Enums"]["question_key"]
          question_number: number
          size_bytes: number | null
          storage_path: string
          submission_id: string
          text_content: string | null
          type: Database["public"]["Enums"]["answer_type"]
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          mime_type?: string | null
          question_key: Database["public"]["Enums"]["question_key"]
          question_number: number
          size_bytes?: number | null
          storage_path: string
          submission_id: string
          text_content?: string | null
          type: Database["public"]["Enums"]["answer_type"]
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          mime_type?: string | null
          question_key?: Database["public"]["Enums"]["question_key"]
          question_number?: number
          size_bytes?: number | null
          storage_path?: string
          submission_id?: string
          text_content?: string | null
          type?: Database["public"]["Enums"]["answer_type"]
        }
        Relationships: [
          {
            foreignKeyName: "answers_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      stations: {
        Row: {
          active: boolean
          created_at: string
          id: string
          label: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id: string
          label: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          label?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          age: Database["public"]["Enums"]["age_range"] | null
          consent_given: boolean
          consent_purpose: string
          consent_version: string
          created_at: string
          gender: Database["public"]["Enums"]["gender"] | null
          id: string
          resident: boolean | null
          station_id: string
          timestamp: string
          updated_at: string
        }
        Insert: {
          age?: Database["public"]["Enums"]["age_range"] | null
          consent_given?: boolean
          consent_purpose?: string
          consent_version?: string
          created_at?: string
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          resident?: boolean | null
          station_id: string
          timestamp?: string
          updated_at?: string
        }
        Update: {
          age?: Database["public"]["Enums"]["age_range"] | null
          consent_given?: boolean
          consent_purpose?: string
          consent_version?: string
          created_at?: string
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          resident?: boolean | null
          station_id?: string
          timestamp?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      submit_survey: {
        Args: {
          station_id_arg: string
          gender_arg?: string
          age_arg?: string
          resident_arg?: boolean
        }
        Returns: string
      }
    }
    Enums: {
      age_range: "Até 18" | "19-25" | "26-35" | "36-45" | "46-60" | "60+"
      answer_type: "text" | "audio"
      gender: "Masculino" | "Feminino" | "Não-binário" | "Prefiro não responder"
      question_key: "future_vision" | "magic_wand" | "what_is_missing"
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
    Enums: {
      age_range: ["Até 18", "19-25", "26-35", "36-45", "46-60", "60+"],
      answer_type: ["text", "audio"],
      gender: ["Masculino", "Feminino", "Não-binário", "Prefiro não responder"],
      question_key: ["future_vision", "magic_wand", "what_is_missing"],
    },
  },
} as const
