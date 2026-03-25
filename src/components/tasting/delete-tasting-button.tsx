"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteTasting } from "@/actions/tastings";

interface DeleteTastingButtonProps {
  tastingId: string;
}

export function DeleteTastingButton({ tastingId }: DeleteTastingButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this tasting?")) return;

    setLoading(true);
    const result = await deleteTasting(tastingId);
    if (result.message) {
      alert(result.message);
      setLoading(false);
    } else {
      router.refresh();
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="text-destructive hover:text-destructive"
    >
      {loading ? "..." : "Delete"}
    </Button>
  );
}
