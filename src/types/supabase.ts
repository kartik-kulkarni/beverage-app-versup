export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      beverages: {
        Row: {
          id: string;
          name: string;
          type: string;
          description: string;
          tasting_notes: string;
          photo_url: string;
          serving_suggestions: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          description?: string;
          tasting_notes?: string;
          photo_url?: string;
          serving_suggestions?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          description?: string;
          tasting_notes?: string;
          photo_url?: string;
          serving_suggestions?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tastings: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          beverages: Json;
          is_completed: boolean;
          current_beverage_index: number;
          session_status: string;
          guests: string[];
          guest_ratings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          beverages?: Json;
          is_completed?: boolean;
          current_beverage_index?: number;
          session_status?: string;
          guests?: string[];
          guest_ratings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          beverages?: Json;
          is_completed?: boolean;
          current_beverage_index?: number;
          session_status?: string;
          guests?: string[];
          guest_ratings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tastings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
