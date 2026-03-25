import type { TastingBeverage } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface BeverageDetailsCardProps {
  beverage: TastingBeverage;
}

export function BeverageDetailsCard({ beverage }: BeverageDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="font-[family-name:var(--font-playfair)] text-xl">
              {beverage.name}
            </CardTitle>
            <Badge variant="secondary" className="mt-1">
              {beverage.type}
            </Badge>
          </div>
          {beverage.photo_url && (
            <img
              src={beverage.photo_url}
              alt={beverage.name}
              className="h-24 w-16 rounded-md object-cover"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {beverage.description && (
          <div>
            <h4 className="mb-1 text-sm font-medium text-muted-foreground">
              About
            </h4>
            <p className="text-sm leading-relaxed">{beverage.description}</p>
          </div>
        )}

        {beverage.tasting_notes && (
          <div>
            <h4 className="mb-1 text-sm font-medium text-muted-foreground">
              Tasting Notes
            </h4>
            <p className="text-sm leading-relaxed">{beverage.tasting_notes}</p>
          </div>
        )}

        {beverage.serving_suggestions.length > 0 && (
          <div>
            <Separator className="mb-3" />
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">
              Serving Suggestions
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {beverage.serving_suggestions.map((suggestion, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
