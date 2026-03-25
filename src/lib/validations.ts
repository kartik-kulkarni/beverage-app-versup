import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const searchBeverageSchema = z.object({
  query: z.string().min(1, "Search query is required"),
});

export const beverageDetailsSchema = z.object({
  name: z.string().min(1, "Beverage name is required"),
  type: z.string().min(1, "Beverage type is required"),
  force_refresh: z.boolean().default(false),
});

export const tastingBeverageSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  description: z.string().default(""),
  tasting_notes: z.string().default(""),
  photo_url: z.string().default(""),
  serving_suggestions: z.array(z.string()).default([]),
  user_notes: z.string().default(""),
  user_rating: z.number().int().min(1).max(5).nullable().default(null),
});

export const createTastingSchema = z.object({
  name: z
    .string()
    .min(1, "Tasting name is required")
    .max(100, "Tasting name must be at most 100 characters"),
  beverages: z.array(tastingBeverageSchema).default([]),
});

export const updateTastingSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  beverages: z.array(tastingBeverageSchema).optional(),
  is_completed: z.boolean().optional(),
  current_beverage_index: z.number().int().min(0).optional(),
});

export const guestJoinSchema = z.object({
  guest_name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be at most 50 characters"),
});

export const guestRatingSchema = z.object({
  guest_name: z.string().min(1),
  beverage_index: z.number().int().min(0),
  rating: z.number().int().min(1).max(5).nullable().default(null),
  notes: z.string().default(""),
});

export const sessionStatusSchema = z.object({
  status: z.enum(["setup", "in_progress", "completed"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreateTastingInput = z.infer<typeof createTastingSchema>;
export type UpdateTastingInput = z.infer<typeof updateTastingSchema>;
export type GuestJoinInput = z.infer<typeof guestJoinSchema>;
export type GuestRatingInput = z.infer<typeof guestRatingSchema>;
