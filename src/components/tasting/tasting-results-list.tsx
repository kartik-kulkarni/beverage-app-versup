import type { GuestRating } from "@/types";
import type { BeverageScore } from "@/lib/tasting-scores";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./star-rating";

interface TastingResultsListProps {
  items: BeverageScore[];
  guestRatingsByBeverage: Record<number, GuestRating[]>;
}

export function TastingResultsList({
  items,
  guestRatingsByBeverage,
}: TastingResultsListProps) {
  if (items.length === 0) {
    return <p className="text-center text-muted-foreground">No results yet.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item, rank) => {
        const guestRatings = guestRatingsByBeverage[item.index] ?? [];

        return (
          <Card key={item.index}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      #{rank + 1}
                    </span>
                    <CardTitle className="text-lg">
                      {item.beverage.name}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {item.beverage.type}
                  </Badge>
                </div>
                {item.averageRating !== null && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {item.averageRating.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">avg</div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.beverage.user_rating !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Host</span>
                  <StarRating
                    value={item.beverage.user_rating}
                    readonly
                    size="sm"
                  />
                </div>
              )}
              {item.beverage.user_notes && (
                <p className="text-sm italic text-muted-foreground">
                  &ldquo;{item.beverage.user_notes}&rdquo;
                </p>
              )}
              {guestRatings.length > 0 && (
                <div className="space-y-2 border-t border-border pt-3">
                  {guestRatings.map((gr) => (
                    <div
                      key={`${gr.guest_name}-${gr.beverage_index}`}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-muted-foreground">
                        {gr.guest_name}
                      </span>
                      <StarRating
                        value={gr.rating}
                        readonly
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
