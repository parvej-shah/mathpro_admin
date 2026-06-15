"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  /** Optional small descriptor under the title. */
  subtitle?: string;
  /** Optional leading icon for the header. */
  icon?: LucideIcon;
  /** Right-aligned header slot (toggles, badges, legends). */
  toolbar?: React.ReactNode;
  /** When true, render the skeleton body. */
  loading?: boolean;
  /** When true (and not loading), render the empty state. */
  empty?: boolean;
  emptyLabel?: string;
  /** Remove body padding (e.g. for full-bleed tables). */
  flush?: boolean;
  className?: string;
  bodyClassName?: string;
  /** Approximate body height used for skeleton/empty sizing. */
  minHeight?: number;
  children?: React.ReactNode;
}

/**
 * Unified titled card shell for every chart / table / panel across the redesigned
 * dashboards. Centralizes header rhythm + skeleton + empty states so individual
 * widgets stay lean.
 */
export function ChartCard({
  title,
  subtitle,
  icon: Icon,
  toolbar,
  loading = false,
  empty = false,
  emptyLabel = "No data for this period",
  flush = false,
  className,
  bodyClassName,
  minHeight = 240,
  children,
}: ChartCardProps) {
  return (
    <Card
      className={cn(
        "border-border/60 transition-colors duration-200 hover:border-primary/30",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/15 shrink-0">
              <Icon className="h-4 w-4 text-primary" />
            </span>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold tracking-tight truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {toolbar && <div className="shrink-0">{toolbar}</div>}
      </div>

      <CardContent className={cn(flush ? "p-0" : "px-5 pb-5 pt-1", bodyClassName)}>
        {loading ? (
          <div
            className="flex flex-col gap-3"
            style={{ minHeight }}
            aria-hidden
          >
            <Skeleton className="h-full w-full flex-1 rounded-lg" />
          </div>
        ) : empty ? (
          <div
            className="flex flex-col items-center justify-center text-center gap-2 text-muted-foreground"
            style={{ minHeight }}
          >
            <Inbox className="h-7 w-7 opacity-40" />
            <p className="text-xs">{emptyLabel}</p>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
