"use client";

import { useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tasting } from "@/types";

type TastingChangeHandler = (tasting: Tasting) => void;

export function useTastingRealtime(
  tastingId: string | undefined,
  onUpdate: TastingChangeHandler
) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const stableCallback = useCallback((tasting: Tasting) => {
    onUpdateRef.current(tasting);
  }, []);

  useEffect(() => {
    if (!tastingId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`tasting-${tastingId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tastings",
          filter: `id=eq.${tastingId}`,
        },
        (payload) => {
          const newRow = payload.new as Tasting;
          stableCallback(newRow);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tastingId, stableCallback]);
}
