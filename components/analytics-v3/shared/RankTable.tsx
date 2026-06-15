"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { V3RankRow } from "@/types/analytics-v3.types";

const RANK_COLORS = [
  "var(--primary)",
  "var(--info)",
  "var(--warning)",
  "var(--success)",
  "var(--destructive)",
  "var(--accent)",
  "var(--secondary)",
  "var(--teal)",
];

interface RankTableProps {
  rows: V3RankRow[];
  /** Header for the primary value column. */
  valueLabel: string;
  /** Header for the secondary column (omit to hide it). */
  secondaryLabel?: string;
  /** Formatter for the primary value (e.g. currency). */
  formatValue?: (v: number) => string;
  /** Formatter for the secondary value. */
  formatSecondary?: (v: number) => string;
  /** Show the numbered rank chip. */
  showRank?: boolean;
  className?: string;
}

/**
 * Numbered "Top Performing" table, generalized from the duplicated course/bundle
 * tables. Renders nothing-fancy, dense rows with a colored rank chip.
 */
export function RankTable({
  rows,
  valueLabel,
  secondaryLabel,
  formatValue = (v) => v.toLocaleString(),
  formatSecondary = (v) => v.toLocaleString(),
  showRank = true,
  className,
}: RankTableProps) {
  return (
    <div className={cn("w-full", className)}>
      <table className="w-full table-fixed text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Name
            </th>
            {secondaryLabel && (
              <th className="w-28 px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {secondaryLabel}
              </th>
            )}
            <th className="w-32 px-5 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {valueLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id}
              className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
            >
              <td className="px-5 py-2.5">
                <div className="flex items-center gap-3">
                  {showRank && (
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground"
                      style={{ background: RANK_COLORS[i % RANK_COLORS.length] }}
                    >
                      {i + 1}
                    </span>
                  )}
                  <span className="truncate font-medium" title={row.label}>
                    {row.label}
                  </span>
                </div>
              </td>
              {secondaryLabel && (
                <td className="w-28 px-3 py-2.5 text-right font-medium tabular-nums">
                  {row.secondary !== undefined
                    ? formatSecondary(row.secondary)
                    : "—"}
                </td>
              )}
              <td className="w-32 px-5 py-2.5 text-right font-semibold tabular-nums text-success">
                {formatValue(row.value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
