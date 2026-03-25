import type { Tasting, TastingBeverage, GuestRating } from "@/types";

export interface BeverageScore {
  beverage: TastingBeverage;
  index: number;
  averageRating: number | null;
}

export interface TastingScores {
  guestRatingsByBeverage: Record<number, GuestRating[]>;
  beveragesWithScores: BeverageScore[];
  sortedBeverages: BeverageScore[];
  overallAverage: string | null;
}

export function computeTastingScores(tasting: Tasting | null): TastingScores {
  const guestRatingsByBeverage: Record<number, GuestRating[]> = {};

  tasting?.guest_ratings.forEach((rating) => {
    const list = guestRatingsByBeverage[rating.beverage_index] ?? [];
    guestRatingsByBeverage[rating.beverage_index] = [...list, rating];
  });

  const beveragesWithScores: BeverageScore[] = tasting
    ? tasting.beverages.map((bev, idx) => {
        const guests = guestRatingsByBeverage[idx] ?? [];
        const allRatings = [
          ...(bev.user_rating ? [bev.user_rating] : []),
          ...guests
            .map((g) => g.rating)
            .filter((r): r is number => r !== null && r !== undefined),
        ];

        const average =
          allRatings.length > 0
            ? allRatings.reduce((acc, r) => acc + r, 0) / allRatings.length
            : null;

        return { beverage: bev, index: idx, averageRating: average };
      })
    : [];

  const sortedBeverages = [...beveragesWithScores].sort((a, b) => {
    if (a.averageRating === null && b.averageRating === null) return 0;
    if (a.averageRating === null) return 1;
    if (b.averageRating === null) return -1;
    return b.averageRating - a.averageRating;
  });

  const overallAverage = (() => {
    const withRatings = beveragesWithScores.filter(
      (b) => b.averageRating !== null
    );
    if (withRatings.length === 0) return null;
    const sum = withRatings.reduce(
      (acc, item) => acc + (item.averageRating ?? 0),
      0
    );
    return (sum / withRatings.length).toFixed(1);
  })();

  return {
    guestRatingsByBeverage,
    beveragesWithScores,
    sortedBeverages,
    overallAverage,
  };
}
