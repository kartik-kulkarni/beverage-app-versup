import { Badge } from "@/components/ui/badge";

interface GuestListProps {
  guests: string[];
  title?: string;
}

export function GuestList({ guests, title = "Guests" }: GuestListProps) {
  if (guests.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No guests yet</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">
        {title} ({guests.length})
      </h3>
      <div className="flex flex-wrap gap-2">
        {guests.map((guest) => (
          <Badge key={guest} variant="secondary">
            {guest}
          </Badge>
        ))}
      </div>
    </div>
  );
}
