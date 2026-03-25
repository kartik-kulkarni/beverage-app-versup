"use client";

import { useState, useEffect, useRef, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createTasting, type ActionState } from "@/actions/tastings";
import type { BeverageSuggestion, TastingBeverage } from "@/types";

const initialState: ActionState = {};

export default function CreateTastingPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createTasting, initialState);
  const [tastingName, setTastingName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<BeverageSuggestion[]>([]);
  const [beverages, setBeverages] = useState<TastingBeverage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    setIsSearching(true);
    try {
      const res = await fetch("/api/beverages/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectBeverage = async (suggestion: BeverageSuggestion) => {
    setShowSuggestions(false);
    setSearchQuery("");
    setSuggestions([]);
    setIsLoadingDetails(true);
    setError("");
    try {
      const res = await fetch("/api/beverages/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: suggestion.name, type: suggestion.type }),
      });
      const details = await res.json();
      if (details.error) {
        setError(details.error);
        return;
      }
      setBeverages((prev) => [
        ...prev,
        {
          name: details.name,
          type: details.type,
          description: details.description,
          tasting_notes: details.tasting_notes,
          photo_url: details.photo_url,
          serving_suggestions: details.serving_suggestions || [],
          user_notes: "",
          user_rating: null,
        },
      ]);
    } catch {
      setError("Failed to get beverage details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleRemoveBeverage = (index: number) => {
    setBeverages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveBeverage = (index: number, direction: "up" | "down") => {
    setBeverages((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold">
          Create New Tasting
        </h1>
        <p className="text-muted-foreground">
          Add beverages and start your tasting session
        </p>
      </div>

      {(error || state.message) && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error || state.message}
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="tastingName">Tasting Name</Label>
          <Input
            id="tastingName"
            value={tastingName}
            onChange={(e) => setTastingName(e.target.value)}
            placeholder="e.g., Whisky Wednesday, Wine Night..."
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label>Add Beverages</Label>
          <div ref={searchRef} className="relative">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                onFocus={() =>
                  suggestions.length > 0 && setShowSuggestions(true)
                }
                placeholder="Search for a beverage..."
                disabled={isLoadingDetails || isSearching}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleSearch}
                disabled={
                  isLoadingDetails ||
                  isSearching ||
                  searchQuery.trim().length < 2
                }
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
                {suggestions.map((s, i) => (
                  <button
                    key={`${s.name}-${i}`}
                    type="button"
                    className="flex w-full flex-col px-4 py-3 text-left hover:bg-accent transition-colors"
                    onClick={() => handleSelectBeverage(s)}
                  >
                    <span className="font-medium">{s.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {s.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {isLoadingDetails && (
            <p className="text-sm text-muted-foreground animate-pulse">
              Fetching beverage details...
            </p>
          )}
        </div>

        {beverages.length > 0 && (
          <div className="space-y-2">
            <Label>Beverages ({beverages.length})</Label>
            <div className="space-y-2">
              {beverages.map((bev, index) => (
                <Card key={`${bev.name}-${index}`}>
                  <CardContent className="flex items-center gap-3 py-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{bev.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {bev.type}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveBeverage(index, "up")}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveBeverage(index, "down")}
                        disabled={index === beverages.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBeverage(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <form ref={formRef} action={formAction}>
          <input type="hidden" name="name" value={tastingName} />
          <input
            type="hidden"
            name="beverages"
            value={JSON.stringify(beverages)}
          />
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/dashboard")}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isPending || beverages.length === 0 || !tastingName.trim()
              }
            >
              {isPending ? "Saving..." : "Next"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
