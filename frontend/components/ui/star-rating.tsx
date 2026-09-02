"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP: Record<NonNullable<StarRatingProps["size"]>, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const displayValue = hovered ?? value;
  const starSize = SIZE_MAP[size];

  return (
    <div
      className="flex items-center gap-1"
      onMouseLeave={() => setHovered(null)}
      role={readOnly ? undefined : "radiogroup"}
      aria-label={readOnly ? undefined : "Note en étoiles"}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= displayValue;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onClick={() => !readOnly && onChange?.(star)}
            className={`${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
            aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`${starSize} ${
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-brand-rose-light/50"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}