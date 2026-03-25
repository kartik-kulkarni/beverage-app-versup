"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTastingRealtime } from "@/hooks/use-tasting-realtime";
import { GuestList } from "@/components/tasting/guest-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tasting } from "@/types";

export default function GuestWaitPage({
  params,
}: {
  params: Promise<{ tastingId: string }>;
}) {
  const { tastingId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const guestName =
    searchParams.get("name") ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem(`guest_name_${tastingId}`) || ""
      : "");

  const [guests, setGuests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("tastings")
        .select("guests, session_status")
        .eq("id", tastingId)
        .single();

      if (data) {
        setGuests((data.guests as unknown as string[]) || []);
        if ((data.session_status as string) !== "setup") {
          router.replace(
            `/guest/${tastingId}/taste?name=${encodeURIComponent(guestName)}`
          );
        }
      }
      setIsLoading(false);
    };
    load();
  }, [tastingId, router, guestName]);

  useTastingRealtime(tastingId, (updated) => {
    setGuests((updated.guests as string[]) || []);
    const status = updated.session_status as string;
    if (status === "in_progress" || status === "completed") {
      router.replace(
        `/guest/${tastingId}/taste?name=${encodeURIComponent(guestName)}`
      );
    }
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-2 text-4xl animate-pulse">⏳</div>
          <CardTitle className="font-[family-name:var(--font-playfair)] text-2xl">
            Waiting for Host
          </CardTitle>
          <CardDescription>
            The host is preparing the tasting. Hang tight!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {guestName && (
            <p className="text-center text-sm">
              Your name: <strong>{guestName}</strong>
            </p>
          )}
          <GuestList guests={guests} title="Guests joined" />
        </CardContent>
      </Card>
    </div>
  );
}
