import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TastingResultsList } from "@/components/tasting/tasting-results-list";
import { computeTastingScores } from "@/lib/tasting-scores";
import type { Tasting, TastingRow } from "@/types";

export const metadata = { title: "Tasting Results" };

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PublicTastingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: tasting } = await supabaseAdmin
    .from("tastings")
    .select("*")
    .eq("id", id)
    .returns<TastingRow[]>()
    .single();

  if (!tasting) notFound();

  const t: Tasting = {
    id: tasting.id,
    user_id: tasting.user_id,
    name: tasting.name,
    beverages: (tasting.beverages as unknown as Tasting["beverages"]) ?? [],
    is_completed: tasting.is_completed,
    current_beverage_index: tasting.current_beverage_index,
    session_status: tasting.session_status as Tasting["session_status"],
    guests: tasting.guests ?? [],
    guest_ratings: (tasting.guest_ratings as unknown as Tasting["guest_ratings"]) ?? [],
    created_at: tasting.created_at,
    updated_at: tasting.updated_at,
  };

  const { guestRatingsByBeverage, sortedBeverages, overallAverage } =
    computeTastingScores(t);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="text-center">
        <div className="mb-2 text-4xl">🥃</div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold">
          {t.name}
        </h1>
        <p className="text-muted-foreground">{formatDate(t.created_at)}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">{t.beverages.length}</div>
            <div className="text-xs text-muted-foreground">Beverages</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-primary">
              {overallAverage ?? "—"}
            </div>
            <div className="text-xs text-muted-foreground">Avg Rating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Badge variant={t.is_completed ? "default" : "secondary"}>
              {t.is_completed ? "Completed" : "In Progress"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {t.guests.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          {t.guests.length} guest{t.guests.length !== 1 ? "s" : ""} participated
        </div>
      )}

      <TastingResultsList
        items={sortedBeverages}
        guestRatingsByBeverage={guestRatingsByBeverage}
      />
    </div>
  );
}
