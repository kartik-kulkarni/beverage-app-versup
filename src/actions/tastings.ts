"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  createTastingSchema,
  updateTastingSchema,
  sessionStatusSchema,
  guestJoinSchema,
  guestRatingSchema,
} from "@/lib/validations";
import type { TastingBeverage, GuestRating } from "@/types";

export type ActionState = {
  errors?: Record<string, string[]>;
  message?: string;
};

export async function createTasting(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { message: "Unauthorized" };

  const beveragesJson = formData.get("beverages") as string;
  let beverages: TastingBeverage[] = [];
  try {
    beverages = JSON.parse(beveragesJson || "[]");
  } catch {
    return { errors: { beverages: ["Invalid beverages data"] } };
  }

  const parsed = createTastingSchema.safeParse({
    name: formData.get("name"),
    beverages,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { data: tasting, error } = await supabase
    .from("tastings")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      beverages: JSON.parse(JSON.stringify(parsed.data.beverages)),
    })
    .select("id")
    .single();

  if (error) return { message: error.message };

  revalidatePath("/dashboard");
  redirect(`/tasting/${tasting.id}`);
}

export async function updateTasting(
  tastingId: string,
  data: Record<string, unknown>
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { message: "Unauthorized" };

  const parsed = updateTastingSchema.safeParse(data);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.beverages !== undefined)
    updateData.beverages = JSON.parse(JSON.stringify(parsed.data.beverages));
  if (parsed.data.is_completed !== undefined)
    updateData.is_completed = parsed.data.is_completed;
  if (parsed.data.current_beverage_index !== undefined)
    updateData.current_beverage_index = parsed.data.current_beverage_index;

  const { error } = await supabase
    .from("tastings")
    .update(updateData)
    .eq("id", tastingId)
    .eq("user_id", user.id);

  if (error) return { message: error.message };

  revalidatePath(`/tasting/${tastingId}`);
  return {};
}

export async function deleteTasting(tastingId: string): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { message: "Unauthorized" };

  const { error } = await supabase
    .from("tastings")
    .delete()
    .eq("id", tastingId)
    .eq("user_id", user.id);

  if (error) return { message: error.message };

  revalidatePath("/dashboard");
  return {};
}

export async function updateSessionStatus(
  tastingId: string,
  status: string
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { message: "Unauthorized" };

  const parsed = sessionStatusSchema.safeParse({ status });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const updateData: Record<string, unknown> = {
    session_status: parsed.data.status,
  };

  if (parsed.data.status === "completed") {
    updateData.is_completed = true;
  }

  const { error } = await supabase
    .from("tastings")
    .update(updateData)
    .eq("id", tastingId)
    .eq("user_id", user.id);

  if (error) return { message: error.message };

  revalidatePath(`/tasting/${tastingId}`);
  return {};
}

export async function updateBeverageIndex(
  tastingId: string,
  index: number
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { message: "Unauthorized" };

  const { error } = await supabase
    .from("tastings")
    .update({ current_beverage_index: index })
    .eq("id", tastingId)
    .eq("user_id", user.id);

  if (error) return { message: error.message };

  revalidatePath(`/tasting/${tastingId}`);
  return {};
}

export async function addGuestToTasting(
  tastingId: string,
  guestName: string
): Promise<ActionState> {
  const parsed = guestJoinSchema.safeParse({ guest_name: guestName });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { data: tasting, error: fetchError } = await supabaseAdmin
    .from("tastings")
    .select("guests, session_status")
    .eq("id", tastingId)
    .single();

  if (fetchError || !tasting) return { message: "Tasting not found" };

  if (tasting.session_status !== "setup") {
    return { message: "Guests can only join before the session starts" };
  }

  const currentGuests: string[] = (tasting.guests as string[]) || [];
  if (currentGuests.includes(parsed.data.guest_name)) {
    return { message: "Guest name already taken" };
  }

  const { error } = await supabaseAdmin
    .from("tastings")
    .update({ guests: [...currentGuests, parsed.data.guest_name] })
    .eq("id", tastingId);

  if (error) return { message: error.message };

  return {};
}

export async function updateGuestRating(
  tastingId: string,
  guestName: string,
  beverageIndex: number,
  rating: number | null,
  notes: string
): Promise<ActionState> {
  const parsed = guestRatingSchema.safeParse({
    guest_name: guestName,
    beverage_index: beverageIndex,
    rating,
    notes,
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { data: tasting, error: fetchError } = await supabaseAdmin
    .from("tastings")
    .select("guest_ratings, session_status")
    .eq("id", tastingId)
    .single();

  if (fetchError || !tasting) return { message: "Tasting not found" };

  if (tasting.session_status === "setup") {
    return { message: "Session has not started yet" };
  }

  const currentRatings: GuestRating[] =
    (tasting.guest_ratings as unknown as GuestRating[]) || [];

  const existingIndex = currentRatings.findIndex(
    (r) =>
      r.guest_name === parsed.data.guest_name &&
      r.beverage_index === parsed.data.beverage_index
  );

  const newRating: GuestRating = {
    guest_name: parsed.data.guest_name,
    beverage_index: parsed.data.beverage_index,
    rating: parsed.data.rating,
    notes: parsed.data.notes,
    created_at: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    currentRatings[existingIndex] = newRating;
  } else {
    currentRatings.push(newRating);
  }

  const { error } = await supabaseAdmin
    .from("tastings")
    .update({ guest_ratings: JSON.parse(JSON.stringify(currentRatings)) })
    .eq("id", tastingId);

  if (error) return { message: error.message };

  return {};
}
