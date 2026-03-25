import type { Database } from "./supabase";

export type TastingRow = Database["public"]["Tables"]["tastings"]["Row"];
export type BeverageRow = Database["public"]["Tables"]["beverages"]["Row"];

export interface BeverageSuggestion {
  name: string;
  type: string;
}

export interface BeverageDetails {
  name: string;
  type: string;
  description: string;
  tasting_notes: string;
  photo_url: string;
  serving_suggestions: string[];
  cached?: boolean;
}

export interface TastingBeverage {
  name: string;
  type: string;
  description: string;
  tasting_notes: string;
  photo_url: string;
  serving_suggestions: string[];
  user_notes: string;
  user_rating: number | null;
}

export interface GuestRating {
  guest_name: string;
  beverage_index: number;
  rating: number | null;
  notes: string;
  created_at: string;
}

export interface Tasting {
  id: string;
  user_id: string;
  name: string;
  beverages: TastingBeverage[];
  is_completed: boolean;
  current_beverage_index: number;
  session_status: "setup" | "in_progress" | "completed";
  guests: string[];
  guest_ratings: GuestRating[];
  created_at: string;
  updated_at: string;
}

export interface TastingListItem {
  id: string;
  name: string;
  beverage_count: number;
  is_completed: boolean;
  session_status: string;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
}
