import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteTastingButton } from "@/components/tasting/delete-tasting-button";
import type { TastingBeverage } from "@/types";

export const metadata = { title: "Dashboard" };

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tastings } = await supabase
    .from("tastings")
    .select("id, name, beverages, is_completed, session_status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const items = (tastings ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    beverage_count: Array.isArray(t.beverages)
      ? (t.beverages as unknown as TastingBeverage[]).length
      : 0,
    is_completed: t.is_completed,
    session_status: t.session_status,
    created_at: t.created_at,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold">
            Your Tastings
          </h1>
          <p className="text-muted-foreground">
            Manage and review your tasting sessions
          </p>
        </div>
        <Link href="/tasting/new" className={buttonVariants()}>+ New Tasting</Link>
      </div>

      {items.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <div className="text-5xl mb-4">🍷</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold mb-2">
              No Tastings Yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Start your first tasting night and discover amazing beverages!
            </p>
            <Link href="/tasting/new" className={buttonVariants()}>Create Your First Tasting</Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((tasting) => (
            <Link
              key={tasting.id}
              href={
                tasting.is_completed
                  ? `/tasting/${tasting.id}`
                  : `/tasting/${tasting.id}/taste`
              }
              className="block"
            >
              <Card className="transition-colors hover:border-primary/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{tasting.name}</CardTitle>
                    <Badge
                      variant={tasting.is_completed ? "default" : "secondary"}
                    >
                      {tasting.is_completed ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{tasting.beverage_count} beverages</span>
                    <span>{formatDate(tasting.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={tasting.is_completed ? "secondary" : "default"}
                      size="sm"
                      className="flex-1"
                    >
                      {tasting.is_completed
                        ? "View Details"
                        : "Continue Tasting"}
                    </Button>
                    <DeleteTastingButton tastingId={tasting.id} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
