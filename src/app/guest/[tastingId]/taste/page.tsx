"use client";

import { useState, useEffect, useMemo, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateGuestRating } from "@/actions/tastings";
import { useTastingRealtime } from "@/hooks/use-tasting-realtime";
import { BeverageDetailsCard } from "@/components/tasting/beverage-details-card";
import { StarRating } from "@/components/tasting/star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Tasting, GuestRating, TastingBeverage, TastingRow } from "@/types";

export default function GuestTastingPage({
  params,
}: {
  params: Promise<{ tastingId: string }>;
}) {
  const { tastingId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const guestName = useMemo(() => {
    const fromParams = searchParams.get("name");
    if (fromParams) return fromParams;
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(`guest_name_${tastingId}`) || "";
    }
    return "";
  }, [searchParams, tastingId]);

  const [tasting, setTasting] = useState<Tasting | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("tastings")
        .select("*")
        .eq("id", tastingId)
        .returns<TastingRow[]>()
        .single();

      if (fetchError || !data) {
        setError("Tasting not found");
        setIsLoading(false);
        return;
      }

      const t: Tasting = {
        id: data.id,
        user_id: data.user_id,
        name: data.name,
        beverages: (data.beverages as unknown as Tasting["beverages"]) ?? [],
        is_completed: data.is_completed,
        current_beverage_index: data.current_beverage_index,
        session_status: data.session_status as Tasting["session_status"],
        guests: data.guests ?? [],
        guest_ratings: (data.guest_ratings as unknown as Tasting["guest_ratings"]) ?? [],
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setTasting(t);
      setCurrentIndex(t.current_beverage_index);
      if (t.session_status === "setup") {
        setError("Waiting for host to start the session...");
      }
      setIsLoading(false);
    };
    load();
  }, [tastingId]);

  useTastingRealtime(tastingId, (updated) => {
    const t: Tasting = {
      ...updated,
      beverages: (updated.beverages as unknown as TastingBeverage[]) ?? [],
      guest_ratings:
        (updated.guest_ratings as unknown as GuestRating[]) ?? [],
      session_status: updated.session_status as Tasting["session_status"],
    };

    setTasting(t);
    setCurrentIndex(t.current_beverage_index);

    if (t.session_status === "completed") {
      router.push(`/tasting-public/${tastingId}`);
    }
    if (t.session_status === "in_progress") {
      setError("");
    }
  });

  const getGuestRating = (beverageIndex: number) => {
    return tasting?.guest_ratings.find(
      (gr) =>
        gr.guest_name === guestName && gr.beverage_index === beverageIndex
    );
  };

  const handleRatingChange = async (rating: number | null) => {
    if (!tasting || !guestName) return;
    setIsSaving(true);
    await updateGuestRating(
      tastingId,
      guestName,
      currentIndex,
      rating,
      getGuestRating(currentIndex)?.notes ?? ""
    );
    setIsSaving(false);
  };

  const handleNotesChange = async (notes: string) => {
    if (!tasting || !guestName) return;
    setIsSaving(true);
    await updateGuestRating(
      tastingId,
      guestName,
      currentIndex,
      getGuestRating(currentIndex)?.rating ?? null,
      notes
    );
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground animate-pulse">
          Loading tasting...
        </p>
      </div>
    );
  }

  if (!tasting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error || "Tasting not found"}</p>
      </div>
    );
  }

  const currentBeverage = tasting.beverages[currentIndex];
  const isCompleted = tasting.session_status === "completed";
  const guestRating = getGuestRating(currentIndex);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
            {tasting.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Beverage {currentIndex + 1} of {tasting.beverages.length}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/tasting-public/${tastingId}`)}
        >
          View Summary
        </Button>
      </div>

      {error && tasting.session_status === "setup" && (
        <div className="rounded-md bg-amber/10 px-4 py-3 text-sm text-amber">
          {error}
        </div>
      )}

      {currentBeverage && (
        <>
          <div className="h-1.5 w-full rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / tasting.beverages.length) * 100}%`,
              }}
            />
          </div>

          <BeverageDetailsCard beverage={currentBeverage} />

          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-medium">Your Rating</h3>
              <StarRating
                value={guestRating?.rating ?? null}
                onChange={handleRatingChange}
                readonly={isCompleted}
              />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Your Notes</h3>
              <Textarea
                value={guestRating?.notes ?? ""}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Add your personal tasting notes here..."
                rows={4}
                disabled={isSaving || isCompleted}
              />
            </div>
          </div>
        </>
      )}

      {isCompleted && (
        <div className="flex justify-center">
          <Button
            onClick={() => router.push(`/tasting-public/${tastingId}`)}
          >
            View Results
          </Button>
        </div>
      )}
    </div>
  );
}
