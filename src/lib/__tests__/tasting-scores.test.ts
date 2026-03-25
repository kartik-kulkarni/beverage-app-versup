import { describe, it, expect } from "vitest";
import { computeTastingScores } from "../tasting-scores";
import type { Tasting } from "@/types";

function makeTasting(overrides: Partial<Tasting> = {}): Tasting {
  return {
    id: "test-id",
    user_id: "user-id",
    name: "Test Tasting",
    beverages: [],
    is_completed: false,
    current_beverage_index: 0,
    session_status: "setup",
    guests: [],
    guest_ratings: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("computeTastingScores", () => {
  it("returns empty results for null tasting", () => {
    const result = computeTastingScores(null);
    expect(result.beveragesWithScores).toHaveLength(0);
    expect(result.sortedBeverages).toHaveLength(0);
    expect(result.overallAverage).toBeNull();
  });

  it("computes host-only ratings", () => {
    const tasting = makeTasting({
      beverages: [
        {
          name: "Whisky A",
          type: "Scotch",
          description: "",
          tasting_notes: "",
          photo_url: "",
          serving_suggestions: [],
          user_notes: "",
          user_rating: 4,
        },
        {
          name: "Whisky B",
          type: "Bourbon",
          description: "",
          tasting_notes: "",
          photo_url: "",
          serving_suggestions: [],
          user_notes: "",
          user_rating: 2,
        },
      ],
    });

    const result = computeTastingScores(tasting);
    expect(result.beveragesWithScores[0].averageRating).toBe(4);
    expect(result.beveragesWithScores[1].averageRating).toBe(2);
    expect(result.overallAverage).toBe("3.0");
    expect(result.sortedBeverages[0].beverage.name).toBe("Whisky A");
  });

  it("combines host and guest ratings", () => {
    const tasting = makeTasting({
      beverages: [
        {
          name: "Wine",
          type: "Red",
          description: "",
          tasting_notes: "",
          photo_url: "",
          serving_suggestions: [],
          user_notes: "",
          user_rating: 5,
        },
      ],
      guest_ratings: [
        {
          guest_name: "Alice",
          beverage_index: 0,
          rating: 3,
          notes: "",
          created_at: new Date().toISOString(),
        },
      ],
    });

    const result = computeTastingScores(tasting);
    expect(result.beveragesWithScores[0].averageRating).toBe(4);
  });

  it("handles beverages with no ratings", () => {
    const tasting = makeTasting({
      beverages: [
        {
          name: "Beer",
          type: "IPA",
          description: "",
          tasting_notes: "",
          photo_url: "",
          serving_suggestions: [],
          user_notes: "",
          user_rating: null,
        },
      ],
    });

    const result = computeTastingScores(tasting);
    expect(result.beveragesWithScores[0].averageRating).toBeNull();
    expect(result.overallAverage).toBeNull();
  });
});
