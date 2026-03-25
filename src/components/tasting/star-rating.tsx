"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number | null;
  onChange?: (rating: number | null) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = hovered !== null ? star <= hovered : value !== null && star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            className={cn(
              sizeClasses[size],
              "transition-colors duration-150",
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110",
              filled ? "text-amber" : "text-muted-foreground/30"
            )}
            onMouseEnter={() => !readonly && setHovered(star)}
            onClick={() => {
              if (readonly || !onChange) return;
              onChange(value === star ? null : star);
            }}
          >
            ★
          </button>
        );
      })}
      {value !== null && (
        <span className="ml-2 text-sm text-muted-foreground">{value}/5</span>
      )}
    </div>
  );
}
