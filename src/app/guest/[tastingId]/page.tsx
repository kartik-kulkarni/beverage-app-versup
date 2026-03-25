"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { addGuestToTasting } from "@/actions/tastings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function GuestJoinPage({
  params,
}: {
  params: Promise<{ tastingId: string }>;
}) {
  const { tastingId } = use(params);
  const router = useRouter();
  const [guestName, setGuestName] = useState("");
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setError("Please enter a name to continue");
      return;
    }

    setError("");
    setIsJoining(true);

    const result = await addGuestToTasting(tastingId, guestName.trim());

    if (result.message) {
      setError(result.message);
      setIsJoining(false);
      return;
    }

    sessionStorage.setItem(`guest_name_${tastingId}`, guestName.trim());
    router.push(`/guest/${tastingId}/wait?name=${encodeURIComponent(guestName.trim())}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-2 text-4xl">🥃</div>
          <CardTitle className="font-[family-name:var(--font-playfair)] text-2xl">
            Join Tasting
          </CardTitle>
          <CardDescription>
            Enter your name to join this tasting session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guestName">Your name</Label>
              <Input
                id="guestName"
                value={guestName}
                maxLength={50}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g., Alex"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isJoining}>
              {isJoining ? "Joining..." : "Join"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
