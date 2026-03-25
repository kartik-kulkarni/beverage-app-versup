"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-2 text-4xl">😵</div>
          <CardTitle>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. Please try again.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => (window.location.href = "/dashboard")}>
              Go Home
            </Button>
            <Button onClick={() => reset()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
