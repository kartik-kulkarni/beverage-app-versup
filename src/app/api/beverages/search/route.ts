import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchBeverages } from "@/lib/deepinfra";
import { searchBeverageSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = searchBeverageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const suggestions = await searchBeverages(parsed.data.query);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Beverage search failed:", error);
    return NextResponse.json(
      { error: "Failed to search beverages" },
      { status: 500 }
    );
  }
}
