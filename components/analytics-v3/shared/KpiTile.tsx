"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeltaBadge } from "./DeltaBadge";
import { TrendChart } from "./TrendChart";
import type { V3SeriesPoint } from "@/types/analytics-v3.types";

export interface KpiTileProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  /** Accent CSS-var token, e.g. "--primary", "--success". */
  accent?: string;
  delta?: number | string | null;
  /** Optional inline sparkline series (rendered only when non-empty). */
  series?: V3SeriesPoint[];
  loading?: boolean;
  className?: string;
}

/**
 * Compact KPI tile: icon + delta badge on top, big value, label, and an optional
 * inline sparkline drawn from the tile's own series. Designed dense (6 per row).
 */
export function KpiTile({
  label,
  value,
  subtitle,
  icon: Icon,
  accent = "--primary",
  delta,
  series,
  loading = false,
  className,
}: KpiTileProps) {
  const hasSpark = Array.isArray(series) && series.length > 1;

  if (loading) {
    return (
      <Card className={cn("border-border/60 overflow-hidden", className)}>
        <CardContent className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-10 rounded-full" />
          </div>
          <Skeleton className="h-6 w-20 mb-1.5" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/60 transition-colors duration-200 hover:border-primary/30",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-[0.06]"
        style={{ backgroundImage: `linear-gradient(to bottom right, var(${accent}), transparent)` }}
      />
      <CardContent className="relative px-4 pt-4 pb-3">
        <div className="mb-2.5 flex items-center justify-between">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background shadow-sm"
          >
            <Icon className="h-4 w-4" style={{ color: `var(${accent})` }} />
          </span>
          {delta !== undefined && <DeltaBadge value={delta} size="sm" />}
        </div>

        <p className="text-2xl font-bold tracking-tight tabular-nums leading-none">
          {value}
        </p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
        {subtitle && (
          <p className="mt-0.5 text-[11px] text-muted-foreground/70">
            {subtitle}
          </p>
        )}

        {hasSpark && (
          <div className="-mx-1 -mb-1 mt-2 h-10">
            <TrendChart
              data={series!}
              colorToken={accent}
              height={40}
              sparkline
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
