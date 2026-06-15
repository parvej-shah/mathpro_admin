"use client";

import * as React from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeltaBadgeProps {
  /** Growth percentage. Accepts number or loose string (e.g. "11.11"). */
  value: number | string | null | undefined;
  className?: string;
  /** Render a tiny variant (smaller text/icon). */
  size?: "sm" | "md";
}

/**
 * Period-over-period growth pill. Positive → success, negative → destructive,
 * zero/neutral → muted. Coerces loose string values from the API at the boundary.
 */
export function DeltaBadge({ value, className, size = "md" }: DeltaBadgeProps) {
  const num =
    value === null || value === undefined || value === ""
      ? null
      : Number(value);

  if (num === null || Number.isNaN(num)) return null;

  const positive = num > 0;
  const negative = num < 0;
  const Icon = positive ? ArrowUp : negative ? ArrowDown : Minus;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full font-semibold tabular-nums",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        positive && "bg-success/10 text-success",
        negative && "bg-destructive/10 text-destructive",
        !positive && !negative && "bg-muted text-muted-foreground",
        className
      )}
    >
      <Icon className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {Math.abs(num).toFixed(1)}%
    </span>
  );
}
