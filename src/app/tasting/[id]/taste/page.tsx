"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateTasting, updateSessionStatus } from "@/actions/tastings";
import { useTastingRealtime } from "@/hooks/use-tasting-realtime";
import { BeverageDetailsCard } from "@/components/tasting/beverage-details-card";
import { StarRating } from "@/components/tasting/star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Tasting, TastingBeverage, TastingRow } from "@/types";

export default function TastingModePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [tasting, setTasting] = useState<Tasting | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const loadTasting = useCallback(async () => {
    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from("tastings")
      .select("*")
      .eq("id", id)
      .returns<TastingRow[]>()
      .single();

    if (fetchError || !data) {
      setError("Failed to load tasting");
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
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadTasting();
  }, [loadTasting]);

  useTastingRealtime(id, (updated) => {
    setTasting({
      ...updated,
      beverages: (updated.beverages as unknown as TastingBeverage[]) ?? [],
      guest_ratings: (updated.guest_ratings as unknown as Tasting["guest_ratings"]) ?? [],
      session_status: updated.session_status as Tasting["session_status"],
    });
  });

  const saveBeverages = async (
    beverages: TastingBeverage[],
    index: number,
    complete = false
  ) => {
    if (!tasting) return;
    setIsSaving(true);
    await updateTasting(tasting.id, {
      beverages,
      current_beverage_index: index,
      is_completed: complete || undefined,
    });
    setIsSaving(false);
  };

  const handleNotesChange = (notes: string) => {
    if (!tasting) return;
    const updated = [...tasting.beverages];
    updated[currentIndex] = { ...updated[currentIndex], user_notes: notes };
    setTasting({ ...tasting, beverages: updated });
  };

  const handleRatingChange = (rating: number | null) => {
    if (!tasting) return;
    const updated = [...tasting.beverages];
    updated[currentIndex] = { ...updated[currentIndex], user_rating: rating };
    setTasting({ ...tasting, beverages: updated });
  };

  const handlePrevious = async () => {
    if (!tasting || currentIndex === 0) return;
    const newIndex = currentIndex - 1;
    await saveBeverages(tasting.beverages, newIndex);
    setCurrentIndex(newIndex);
  };

  const handleNext = async () => {
    if (!tasting) return;
    const isLast = currentIndex === tasting.beverages.length - 1;
    if (isLast) {
      await saveBeverages(tasting.beverages, currentIndex, true);
      await updateSessionStatus(tasting.id, "completed");
      router.push(`/tasting/${tasting.id}`);
    } else {
      const newIndex = currentIndex + 1;
      await saveBeverages(tasting.beverages, newIndex);
      setCurrentIndex(newIndex);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground animate-pulse">
          Loading tasting...
        </p>
      </div>
    );
  }

  if (error || !tasting) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-destructive">{error || "Tasting not found"}</p>
        <Button variant="secondary" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const currentBeverage = tasting.beverages[currentIndex];
  if (!currentBeverage) return null;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === tasting.beverages.length - 1;

  return (
    <div className="space-y-6">
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
          onClick={() => router.push("/dashboard")}
        >
          Exit
        </Button>
      </div>

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
            value={currentBeverage.user_rating}
            onChange={handleRatingChange}
          />
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium">Your Notes</h3>
          <Textarea
            value={currentBeverage.user_notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Add your personal tasting notes here..."
            rows={4}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button
          variant="secondary"
          onClick={handlePrevious}
          disabled={isFirst || isSaving}
        >
          ← Previous
        </Button>
        <Button onClick={handleNext} disabled={isSaving}>
          {isSaving
            ? "Saving..."
            : isLast
              ? "Complete Tasting"
              : "Next →"}
        </Button>
      </div>
    </div>
  );
}
