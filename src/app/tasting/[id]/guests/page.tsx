"use client";

import { useState, useEffect, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateSessionStatus } from "@/actions/tastings";
import { useTastingRealtime } from "@/hooks/use-tasting-realtime";
import { QRCodeDisplay } from "@/components/tasting/qr-code-display";
import { GuestList } from "@/components/tasting/guest-list";
import { Button } from "@/components/ui/button";
import type { Tasting, TastingRow } from "@/types";

export default function AddGuestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [tasting, setTasting] = useState<Tasting | null>(null);
  const [guests, setGuests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

  const guestUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/guest/${id}`;
  }, [id]);

  useEffect(() => {
    const load = async () => {
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
      setGuests(t.guests || []);
      setIsLoading(false);
    };
    load();
  }, [id]);

  useTastingRealtime(id, (updated) => {
    setGuests((updated.guests as string[]) || []);
  });

  const handleStartSession = async () => {
    setIsStarting(true);
    setError("");
    const result = await updateSessionStatus(id, "in_progress");
    if (result.message) {
      setError(result.message);
      setIsStarting(false);
    } else {
      router.push(`/tasting/${id}/taste`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  if (error && !tasting) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-destructive">{error}</p>
        <Button variant="secondary" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold">
            Add Guests
          </h1>
          <p className="text-muted-foreground">
            Share this QR code so guests can join{" "}
            <strong>{tasting?.name}</strong> before you start.
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
        >
          Exit
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-6">
        {guestUrl && (
          <QRCodeDisplay url={guestUrl} label="Guests can scan to join" />
        )}
        <GuestList guests={guests} />
        <p className="text-sm text-muted-foreground">
          Guests will appear here as soon as they connect.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          disabled={isStarting}
        >
          Back
        </Button>
        <Button onClick={handleStartSession} disabled={isStarting}>
          {isStarting ? "Starting..." : "Start Session"}
        </Button>
      </div>
    </div>
  );
}
