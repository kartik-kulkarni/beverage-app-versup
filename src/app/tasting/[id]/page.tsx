import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/lib/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TastingResultsList } from "@/components/tasting/tasting-results-list";
import { ShareQR } from "@/components/tasting/share-qr";
import { computeTastingScores } from "@/lib/tasting-scores";
import type { Tasting, TastingRow } from "@/types";

export const metadata = { title: "Tasting Details" };

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ViewTastingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tasting } = await supabase
    .from("tastings")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
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
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mt-2">
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

      {!t.is_completed && (
        <Card className="border-primary/30">
          <CardContent className="flex items-center justify-between py-4">
            <p className="text-sm">This tasting is still in progress.</p>
            <Link href={`/tasting/${t.id}/taste`} className={buttonVariants()}>Continue Tasting</Link>
          </CardContent>
        </Card>
      )}

      <TastingResultsList
        items={sortedBeverages}
        guestRatingsByBeverage={guestRatingsByBeverage}
      />

      <div className="flex justify-center">
        <ShareQR
          path={`/tasting-public/${t.id}`}
          label="Share results (public read-only link)"
        />
      </div>
    </div>
  );
}
