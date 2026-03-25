import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBeverageDetails } from "@/lib/deepinfra";
import { beverageDetailsSchema } from "@/lib/validations";
import type { BeverageRow } from "@/types";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = beverageDetailsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, type, force_refresh } = parsed.data;

  try {
    if (!force_refresh) {
      const { data: cached } = await supabase
        .from("beverages")
        .select("*")
        .eq("name", name)
        .eq("type", type)
        .returns<BeverageRow[]>()
        .single();

      if (cached) {
        return NextResponse.json({
          name: cached.name,
          type: cached.type,
          description: cached.description,
          tasting_notes: cached.tasting_notes,
          photo_url: cached.photo_url,
          serving_suggestions: cached.serving_suggestions,
          cached: true,
        });
      }
    }

    const details = await getBeverageDetails(name, type);

    await supabase.from("beverages").upsert(
      {
        name,
        type,
        description: details.description,
        tasting_notes: details.tasting_notes,
        photo_url: details.photo_url,
        serving_suggestions: details.serving_suggestions,
      },
      { onConflict: "name,type" }
    );

    return NextResponse.json({
      name,
      type,
      ...details,
      cached: false,
    });
  } catch (error) {
    console.error("Beverage details failed:", error);
    return NextResponse.json(
      { error: "Failed to get beverage details" },
      { status: 500 }
    );
  }
}
